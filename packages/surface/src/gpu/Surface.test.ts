import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import type { Program } from './Program';
import { Surface } from './Surface';
import type { UniformValue } from './types';

type FrameCallback = (time: number) => void;

interface FakeCanvas {
    clientWidth: number;
    clientHeight: number;
    width: number;
    height: number;
    getContext: () => object;
    getBoundingClientRect: () => { left: number; top: number; width: number; height: number };
    addEventListener: (type: string, listener: (event: Event) => void) => void;
    removeEventListener: (type: string) => void;
    setPointerCapture: () => void;
}

interface FakeProgram {
    setUniforms: ReturnType<typeof vi.fn>;
    render: ReturnType<typeof vi.fn>;
}

interface Harness {
    surface: Surface;
    canvas: FakeCanvas;
    window: { devicePixelRatio: number };
    program: FakeProgram;
    dispatch: (type: string, event: object) => void;
    nextFrame: (time?: number) => void;
}

let scheduled: FrameCallback[] = [];

function createHarness(options?: { width?: number; height?: number; dpr?: number }): Harness {
    const windowStub = { devicePixelRatio: options?.dpr ?? 1 };
    vi.stubGlobal('window', windowStub);

    const listeners = new Map<string, (event: Event) => void>();
    const canvas: FakeCanvas = {
        clientWidth: options?.width ?? 300,
        clientHeight: options?.height ?? 150,
        width: 0,
        height: 0,
        getContext: () => ({}),
        getBoundingClientRect: () => ({
            left: 0,
            top: 0,
            width: canvas.clientWidth,
            height: canvas.clientHeight,
        }),
        addEventListener: (type, listener) => {
            listeners.set(type, listener);
        },
        removeEventListener: (type) => {
            listeners.delete(type);
        },
        setPointerCapture: () => {},
    };

    const surface = new Surface(canvas as unknown as HTMLCanvasElement);
    // Subscribing starts the frame loop, which resizes the surface before the first callback.
    surface.onFrame(() => {});

    const program: FakeProgram = {
        setUniforms: vi.fn(),
        render: vi.fn(),
    };

    return {
        surface,
        canvas,
        window: windowStub,
        program,
        dispatch: (type, event) => {
            listeners.get(type)?.(event as Event);
        },
        nextFrame: (time = 16) => {
            scheduled.shift()?.(time);
        },
    };
}

function renderedUniforms(program: FakeProgram): Record<string, UniformValue> {
    return program.setUniforms.mock.lastCall?.[0] as Record<string, UniformValue>;
}

beforeEach(() => {
    scheduled = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameCallback) => {
        scheduled.push(callback);
        return scheduled.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('Surface size contract', () => {
    it('exposes CSS dimensions and physical dimensions separately', () => {
        const { surface, canvas } = createHarness({ width: 320, height: 180, dpr: 2 });

        expect(surface.width).toBe(320);
        expect(surface.height).toBe(180);
        expect(surface.deviceWidth).toBe(640);
        expect(surface.deviceHeight).toBe(360);
        expect(surface.dpr).toBe(2);
        expect(canvas.width).toBe(640);
        expect(canvas.height).toBe(360);
    });

    it('updates all dimensions when the canvas or the DPR changes', () => {
        const { surface, canvas, window, nextFrame } = createHarness({
            width: 300,
            height: 150,
            dpr: 2,
        });

        canvas.clientWidth = 200;
        canvas.clientHeight = 100;
        window.devicePixelRatio = 1.5;
        nextFrame();

        expect(surface.width).toBe(200);
        expect(surface.height).toBe(100);
        expect(surface.deviceWidth).toBe(300);
        expect(surface.deviceHeight).toBe(150);
        expect(surface.dpr).toBe(1.5);
        expect(canvas.width).toBe(300);
        expect(canvas.height).toBe(150);
    });
});

describe('Surface standard uniforms', () => {
    it('reports iResolution in device pixels', () => {
        const { surface, program } = createHarness({ width: 320, height: 180, dpr: 2 });

        surface.renderProgram(program as unknown as Program);

        expect(renderedUniforms(program).iResolution).toEqual([640, 360, 1]);
    });

    it('converts iMouse from CSS to device pixels with Shadertoy semantics', () => {
        const { surface, program, dispatch } = createHarness({ width: 300, height: 150, dpr: 2 });

        surface.renderProgram(program as unknown as Program);
        expect(renderedUniforms(program).iMouse).toEqual([0, 0, 0, 0]);

        dispatch('pointerdown', { pointerId: 1, clientX: 150, clientY: 75 });
        surface.renderProgram(program as unknown as Program);
        expect(renderedUniforms(program).iMouse).toEqual([300, 150, 300, 150]);

        dispatch('pointermove', { pointerId: 1, clientX: 60, clientY: 30 });
        surface.renderProgram(program as unknown as Program);
        // CSS y is flipped (150 - 30 = 120) before the DPR conversion.
        expect(renderedUniforms(program).iMouse).toEqual([120, 240, 300, 150]);

        dispatch('pointerup', { pointerId: 1 });
        surface.renderProgram(program as unknown as Program);
        expect(renderedUniforms(program).iMouse).toEqual([0, 0, 300, 150]);
    });
});
