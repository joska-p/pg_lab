import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { createCamera } from '../core/Camera';
import { createZoomFactor } from '../core/cameraTypes';
import { createCssColor, createDevicePixelRatio } from '../core/render';
import { createCpuSurface, type CpuSurface } from './CpuSurface';

function createMockCanvas(context: CanvasRenderingContext2D): HTMLCanvasElement {
    return {
        width: 0,
        height: 0,
        clientWidth: 640,
        clientHeight: 480,
        getContext: () => context,
        addEventListener: () => {},
        removeEventListener: () => {},
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 480 }),
    } as unknown as HTMLCanvasElement;
}

describe('CpuSurface.applyCamera', () => {
    let setTransformMock: ReturnType<typeof vi.fn>;
    let surface: CpuSurface;

    beforeEach(() => {
        setTransformMock = vi.fn();
        const context = { setTransform: setTransformMock } as unknown as CanvasRenderingContext2D;

        // `CpuSurface`'s input store binds global window events on attach — stub the global so the
        // constructor works under Node.
        vi.stubGlobal('window', { addEventListener: () => {}, removeEventListener: () => {} });

        surface = createCpuSurface({
            canvas: createMockCanvas(context),
            camera: createCamera(10, 20, createZoomFactor(2)),
            dpr: createDevicePixelRatio(2),
        });
        // Bypass the frame loop: stamp a non-zero CSS size so the guard in `applyCamera` passes.
        surface.width = 640;
        surface.height = 480;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('scales the camera translation by dpr (hidpi offset fix)', () => {
        surface.applyCamera();

        // setTransform(zoom * dpr, 0, 0, zoom * dpr, x * dpr, y * dpr)
        expect(setTransformMock).toHaveBeenLastCalledWith(4, 0, 0, 4, 20, 40);
    });

    it('composes the whole world→device transform in one setTransform (no intermediate scale)', () => {
        surface.applyCamera();

        // Pre-fix, `setTransform(1,0,0,1,0,0)` was followed by separate transform() + scale() calls,
        // leaving the camera translation unscaled by dpr. The fix is a single composed matrix.
        expect(setTransformMock).toHaveBeenCalledTimes(1);
        expect(setTransformMock).toHaveBeenCalledWith(4, 0, 0, 4, 20, 40);
    });
});

describe('CpuSurface object-only draw API (Step 3 reorg)', () => {
    function createDrawMocks() {
        return {
            setTransform: vi.fn(),
            beginPath: vi.fn(),
            rect: vi.fn(),
            arc: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            fillText: vi.fn(),
            strokeText: vi.fn(),
        };
    }

    function createDrawSurface(mocks: Record<string, ReturnType<typeof vi.fn>>): CpuSurface {
        vi.stubGlobal('window', { addEventListener: () => {}, removeEventListener: () => {} });

        return createCpuSurface({
            canvas: createMockCanvas(mocks as unknown as CanvasRenderingContext2D),
            camera: createCamera(0, 0, createZoomFactor(1)),
            dpr: createDevicePixelRatio(1),
        });
    }

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('rectangle(rectangle, style) forwards full-word bounds to the canvas', () => {
        const mocks = createDrawMocks();
        const target = createDrawSurface(mocks);

        target.rectangle(
            { x: 1, y: 2, width: 30, height: 40 },
            { fill: createCssColor('#ff0000') },
        );

        expect(mocks.rect).toHaveBeenCalledWith(1, 2, 30, 40);
        expect(mocks.fill).toHaveBeenCalledTimes(1);
        target.destroy();
    });

    it('circle(circle, style) forwards center and radius to arc()', () => {
        const mocks = createDrawMocks();
        const target = createDrawSurface(mocks);

        target.circle({ center: { x: 5, y: 6 }, radius: 7 }, { fill: createCssColor('#00ff00') });

        expect(mocks.arc).toHaveBeenCalledWith(5, 6, 7, 0, Math.PI * 2);
        target.destroy();
    });

    it('line(segment, style) strokes from a to b', () => {
        const mocks = createDrawMocks();
        const target = createDrawSurface(mocks);

        target.line(
            { a: { x: 0, y: 0 }, b: { x: 10, y: 20 } },
            { stroke: createCssColor('#0000ff') },
        );

        expect(mocks.moveTo).toHaveBeenCalledWith(0, 0);
        expect(mocks.lineTo).toHaveBeenCalledWith(10, 20);
        expect(mocks.stroke).toHaveBeenCalledTimes(1);
        target.destroy();
    });

    it('text(content, position, style) fills at the position', () => {
        const mocks = createDrawMocks();
        const target = createDrawSurface(mocks);

        target.text('hi', { x: 3, y: 4 }, { fill: createCssColor('#ffffff') });

        expect(mocks.fillText).toHaveBeenCalledWith('hi', 3, 4);
        target.destroy();
    });

    it('path(points, style, options) walks every point', () => {
        const mocks = createDrawMocks();
        const target = createDrawSurface(mocks);

        target.path(
            [
                { x: 0, y: 0 },
                { x: 5, y: 0 },
                { x: 5, y: 5 },
            ],
            { stroke: createCssColor('#ffff00') },
            { closed: true },
        );

        expect(mocks.moveTo).toHaveBeenCalledWith(0, 0);
        expect(mocks.lineTo).toHaveBeenCalledWith(5, 0);
        expect(mocks.lineTo).toHaveBeenCalledWith(5, 5);
        expect(mocks.closePath).toHaveBeenCalledTimes(1);
        target.destroy();
    });
});
