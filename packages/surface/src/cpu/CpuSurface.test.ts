import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { CpuSurface } from './CpuSurface';

type FrameCallback = (time: number) => void;

interface FakeCanvas {
    clientWidth: number;
    clientHeight: number;
    width: number;
    height: number;
    getContext: ReturnType<typeof vi.fn>;
    getBoundingClientRect: () => { left: number; top: number; width: number; height: number };
}

interface FakeContext2D {
    canvas: FakeCanvas;
    fillStyle: string | CanvasGradient | CanvasPattern;
    globalAlpha: number;
    globalCompositeOperation: GlobalCompositeOperation;
    setTransform: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
    clearRect: ReturnType<typeof vi.fn>;
    fillRect: ReturnType<typeof vi.fn>;
    fillStyleDuringRect?: string | CanvasGradient | CanvasPattern;
}

interface Harness {
    surface: CpuSurface;
    canvas: FakeCanvas;
    ctx: FakeContext2D;
    window: { devicePixelRatio: number };
    nextFrame: (time?: number) => void;
}

let scheduled: FrameCallback[] = [];

function createFakeContext(canvas: FakeCanvas): FakeContext2D {
    const stateStack: Array<{
        fillStyle: string | CanvasGradient | CanvasPattern;
        globalAlpha: number;
        globalCompositeOperation: GlobalCompositeOperation;
    }> = [];

    const ctx: FakeContext2D = {
        canvas,
        fillStyle: '#000000',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        setTransform: vi.fn(),
        save: vi.fn(() => {
            stateStack.push({
                fillStyle: ctx.fillStyle,
                globalAlpha: ctx.globalAlpha,
                globalCompositeOperation: ctx.globalCompositeOperation,
            });
        }),
        restore: vi.fn(() => {
            const popped = stateStack.pop();
            if (popped) {
                ctx.fillStyle = popped.fillStyle;
                ctx.globalAlpha = popped.globalAlpha;
                ctx.globalCompositeOperation = popped.globalCompositeOperation;
            }
        }),
        clearRect: vi.fn(),
        fillRect: vi.fn(() => {
            ctx.fillStyleDuringRect = ctx.fillStyle;
        }),
    };

    return ctx;
}

function createHarness(options?: {
    width?: number;
    height?: number;
    dpr?: number;
    surfaceDpr?: number;
    now?: () => number;
}): Harness {
    const windowStub = { devicePixelRatio: options?.dpr ?? 1 };
    vi.stubGlobal('window', windowStub);

    const canvas: FakeCanvas = {
        clientWidth: options?.width ?? 300,
        clientHeight: options?.height ?? 150,
        width: 0,
        height: 0,
        getContext: vi.fn(),
        getBoundingClientRect: () => ({
            left: 0,
            top: 0,
            width: canvas.clientWidth,
            height: canvas.clientHeight,
        }),
    };

    const ctx = createFakeContext(canvas);
    canvas.getContext.mockReturnValue(ctx);

    const surface = new CpuSurface(canvas as unknown as HTMLCanvasElement, {
        dpr: options?.surfaceDpr,
        now: options?.now,
    });

    return {
        surface,
        canvas,
        ctx,
        window: windowStub,
        nextFrame: (time = 16) => {
            scheduled.shift()?.(time);
        },
    };
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

describe('CpuSurface constructor & size contract', () => {
    it('throws if Canvas2D context is not supported', () => {
        const canvas = {
            getContext: vi.fn().mockReturnValue(null),
        } as unknown as HTMLCanvasElement;

        expect(() => new CpuSurface(canvas)).toThrow(
            'CpuSurface: Canvas2D is not supported in this environment.',
        );
    });

    it('performs initial sizing and sets transform on construction', () => {
        const { surface, canvas, ctx } = createHarness({ width: 320, height: 180, dpr: 2 });

        expect(surface.width).toBe(320);
        expect(surface.height).toBe(180);
        expect(surface.deviceWidth).toBe(640);
        expect(surface.deviceHeight).toBe(360);
        expect(surface.dpr).toBe(2);
        expect(canvas.width).toBe(640);
        expect(canvas.height).toBe(360);
        // setTransform applied immediately so one-shot drawing works outside the loop
        expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    });

    it('honors dpr option override over window.devicePixelRatio', () => {
        const { surface, canvas } = createHarness({
            width: 100,
            height: 100,
            dpr: 1,
            surfaceDpr: 3,
        });

        expect(surface.dpr).toBe(3);
        expect(surface.deviceWidth).toBe(300);
        expect(surface.deviceHeight).toBe(300);
        expect(canvas.width).toBe(300);
        expect(canvas.height).toBe(300);
    });

    it('updates dimensions and re-applies transform during the frame loop', () => {
        const { surface, canvas, ctx, window, nextFrame } = createHarness({
            width: 300,
            height: 150,
            dpr: 2,
        });

        surface.onFrame(() => {});

        canvas.clientWidth = 200;
        canvas.clientHeight = 100;
        window.devicePixelRatio = 1.5;
        ctx.setTransform.mockClear();

        nextFrame(16);

        expect(surface.width).toBe(200);
        expect(surface.height).toBe(100);
        expect(surface.deviceWidth).toBe(300);
        expect(surface.deviceHeight).toBe(150);
        expect(surface.dpr).toBe(1.5);
        expect(ctx.setTransform).toHaveBeenCalledWith(1.5, 0, 0, 1.5, 0, 0);
    });

    it('handles 0x0 canvas without division by zero or errors', () => {
        const { surface, canvas } = createHarness({ width: 0, height: 0, dpr: 2 });

        expect(surface.width).toBe(0);
        expect(surface.height).toBe(0);
        expect(surface.deviceWidth).toBe(0);
        expect(surface.deviceHeight).toBe(0);
        expect(canvas.width).toBe(0);
        expect(canvas.height).toBe(0);
    });
});

describe('CpuSurface frame loop & clock', () => {
    it('notifies subscribers on each frame with surface instance', () => {
        const { surface, nextFrame } = createHarness();
        const callback = vi.fn();

        surface.onFrame(callback);
        // Subscribing immediately executes the first synchronous tick
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(surface);
        expect(surface.frameCount).toBe(1);

        nextFrame(16);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(surface.frameCount).toBe(2);
    });

    it('ticks clock and advances time & deltaTime', () => {
        let currentTime = 1000;
        const { surface, nextFrame } = createHarness({ now: () => currentTime });

        surface.onFrame(() => {});

        // Frame 1 is run synchronously on subscribe; initial delta is 0
        expect(surface.time).toBe(0);
        expect(surface.deltaTime).toBe(0);
        expect(surface.frameCount).toBe(1);

        // Frame 2: 50ms later (1050ms)
        currentTime = 1050;
        nextFrame(1050);
        expect(surface.time).toBeCloseTo(0.05);
        expect(surface.deltaTime).toBeCloseTo(0.05);
        expect(surface.frameCount).toBe(2);
    });

    it('stops ticking when the subscriber unsubscribes', () => {
        const { surface, nextFrame } = createHarness();
        const callback = vi.fn();

        const unsubscribe = surface.onFrame(callback);
        // Frame 1 executed on subscribe
        expect(callback).toHaveBeenCalledTimes(1);

        nextFrame(16);
        expect(callback).toHaveBeenCalledTimes(2);

        unsubscribe();
        nextFrame(32);
        // Unsubscribed, no more calls
        expect(callback).toHaveBeenCalledTimes(2);
    });
});

describe('CpuSurface clear', () => {
    it('clears canvas using device dimensions and identity transform', () => {
        const { surface, ctx } = createHarness({ width: 320, height: 180, dpr: 2 });

        surface.clear();

        expect(ctx.save).toHaveBeenCalledTimes(1);
        expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
        expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 640, 360);
        expect(ctx.restore).toHaveBeenCalledTimes(1);
    });

    it('fills canvas with specified color and restores previous fillStyle', () => {
        const { surface, ctx } = createHarness({ width: 200, height: 100, dpr: 1 });
        ctx.fillStyle = '#123456';

        surface.clear('#ff0000');

        expect(ctx.save).toHaveBeenCalledTimes(1);
        expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
        expect(ctx.fillStyleDuringRect).toBe('#ff0000');
        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 200, 100);
        expect(ctx.restore).toHaveBeenCalledTimes(1);
        // Original style was restored
        expect(ctx.fillStyle).toBe('#123456');
    });

    it('neutralizes globalAlpha and globalCompositeOperation during clear', () => {
        const { surface, ctx } = createHarness();
        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = 'multiply';

        surface.clear();

        // After restore, previous values are restored by the state stack
        expect(ctx.globalAlpha).toBe(0.5);
        expect(ctx.globalCompositeOperation).toBe('multiply');
    });

    it('does not draw when device dimensions are 0', () => {
        const { surface, ctx } = createHarness({ width: 0, height: 0 });

        surface.clear();

        expect(ctx.save).not.toHaveBeenCalled();
        expect(ctx.clearRect).not.toHaveBeenCalled();
        expect(ctx.fillRect).not.toHaveBeenCalled();
    });
});

describe('CpuSurface lifecycle & disposal', () => {
    it('destroy stops the frame loop and is idempotent', () => {
        const { surface, nextFrame } = createHarness();
        const callback = vi.fn();

        surface.onFrame(callback);
        expect(callback).toHaveBeenCalledTimes(1);

        nextFrame(16);
        expect(callback).toHaveBeenCalledTimes(2);

        surface.destroy();
        surface.destroy(); // idempotent

        nextFrame(32);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('dispose delegates to destroy', () => {
        const { surface } = createHarness();
        const destroySpy = vi.spyOn(surface, 'destroy');

        surface.dispose();
        expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('onFrame and clear are no-ops after destroy', () => {
        const { surface, ctx } = createHarness();
        surface.destroy();

        const callback = vi.fn();
        const unsubscribe = surface.onFrame(callback);
        expect(unsubscribe).toBeDefined();

        surface.clear();
        expect(ctx.save).not.toHaveBeenCalled();
    });
});
