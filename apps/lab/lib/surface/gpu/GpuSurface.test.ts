import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { GpuSurface } from './GpuSurface';
import type { Program } from './Program';
import type { UniformValue } from './types';

type FrameCallback = (time: number) => void;

// ---------------------------------------------------------------------------
// Minimal fake WebGL2 context

interface FakeGl {
    FRAMEBUFFER: number;
    FRAMEBUFFER_COMPLETE: number;
    COLOR_ATTACHMENT0: number;
    COLOR_BUFFER_BIT: number;
    TEXTURE_2D: number;
    RGBA8: number;
    RGBA: number;
    UNSIGNED_BYTE: number;
    TEXTURE_MIN_FILTER: number;
    TEXTURE_MAG_FILTER: number;
    TEXTURE_WRAP_S: number;
    TEXTURE_WRAP_T: number;
    NEAREST: number;
    LINEAR: number;
    CLAMP_TO_EDGE: number;
    deleteTexture: ReturnType<typeof vi.fn>;
    deleteFramebuffer: ReturnType<typeof vi.fn>;
    createTexture: ReturnType<typeof vi.fn>;
    createFramebuffer: ReturnType<typeof vi.fn>;
    bindTexture: ReturnType<typeof vi.fn>;
    texImage2D: ReturnType<typeof vi.fn>;
    texParameteri: ReturnType<typeof vi.fn>;
    bindFramebuffer: ReturnType<typeof vi.fn>;
    framebufferTexture2D: ReturnType<typeof vi.fn>;
    checkFramebufferStatus: ReturnType<typeof vi.fn>;
    viewport: ReturnType<typeof vi.fn>;
    clearColor: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
}

let textureCounter = 0;
let fboCounter = 0;

function createFakeGl(): FakeGl {
    return {
        FRAMEBUFFER: 0x8d40,
        FRAMEBUFFER_COMPLETE: 0x8cd5,
        COLOR_ATTACHMENT0: 0x8ce0,
        COLOR_BUFFER_BIT: 0x4000,
        TEXTURE_2D: 0x0de1,
        RGBA8: 0x8058,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        NEAREST: 0x2600,
        LINEAR: 0x2601,
        CLAMP_TO_EDGE: 0x812f,
        deleteTexture: vi.fn(),
        deleteFramebuffer: vi.fn(),
        createTexture: vi.fn(() => ({ _id: ++textureCounter })),
        createFramebuffer: vi.fn(() => ({ _id: ++fboCounter })),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        checkFramebufferStatus: vi.fn(() => 0x8cd5), // FRAMEBUFFER_COMPLETE
        viewport: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
    };
}

// ---------------------------------------------------------------------------

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
    surface: GpuSurface;
    canvas: FakeCanvas;
    window: { devicePixelRatio: number };
    program: FakeProgram;
    dispatch: (type: string, event: object) => void;
    nextFrame: (time?: number) => void;
    fakeGl: FakeGl;
}

let scheduled: FrameCallback[] = [];

function createHarness(options?: { width?: number; height?: number; dpr?: number }): Harness {
    const windowStub = { devicePixelRatio: options?.dpr ?? 1 };
    vi.stubGlobal('window', windowStub);

    const fakeGl = createFakeGl();
    const listeners = new Map<string, (event: Event) => void>();
    const canvas: FakeCanvas = {
        clientWidth: options?.width ?? 300,
        clientHeight: options?.height ?? 150,
        width: 0,
        height: 0,
        getContext: () => fakeGl,
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

    const surface = new GpuSurface(canvas as unknown as HTMLCanvasElement);
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
        fakeGl,
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
    textureCounter = 0;
    fboCounter = 0;
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

describe('GpuSurface size contract', () => {
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

describe('GpuSurface standard uniforms', () => {
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

describe('GpuSurface resource ownership — RenderTarget', () => {
    it('destroys tracked RenderTargets when the surface is destroyed', () => {
        const { surface, fakeGl } = createHarness();

        const target = surface.createRenderTarget(64, 64);
        expect(fakeGl.deleteTexture).not.toHaveBeenCalled();

        surface.destroy();

        // destroy() calls deleteTexture and deleteFramebuffer for the tracked target
        expect(fakeGl.deleteTexture).toHaveBeenCalledTimes(1);
        expect(fakeGl.deleteFramebuffer).toHaveBeenCalledTimes(1);

        // Calling destroy again on the surface is idempotent
        surface.destroy();
        expect(fakeGl.deleteTexture).toHaveBeenCalledTimes(1);

        // Prevent unused variable warning
        void target;
    });

    it('forgets a RenderTarget that was explicitly destroyed before the surface', () => {
        const { surface, fakeGl } = createHarness();

        const target = surface.createRenderTarget(64, 64);
        target.destroy();

        // GL cleanup happened exactly once (from target.destroy)
        expect(fakeGl.deleteTexture).toHaveBeenCalledTimes(1);

        // GpuSurface destroy should not destroy the already-destroyed target again
        const callsBefore = fakeGl.deleteTexture.mock.calls.length;
        surface.destroy();
        expect(fakeGl.deleteTexture).toHaveBeenCalledTimes(callsBefore);
    });

    it('reinitialises tracked RenderTargets on context restore', () => {
        const { surface, fakeGl, dispatch } = createHarness();

        surface.createRenderTarget(64, 64);

        // 1 createTexture call so far (from createRenderTarget)
        expect(fakeGl.createTexture).toHaveBeenCalledTimes(1);

        dispatch('webglcontextrestored', {});

        // reinitialize() should create a new texture and FBO
        expect(fakeGl.createTexture).toHaveBeenCalledTimes(2);
        expect(fakeGl.createFramebuffer).toHaveBeenCalledTimes(2);
    });
});

describe('GpuSurface resource ownership — TargetPair', () => {
    it('destroys tracked TargetPairs when the surface is destroyed', () => {
        const { surface, fakeGl } = createHarness();

        const pair = surface.createTargetPair(32, 32);
        expect(fakeGl.deleteTexture).not.toHaveBeenCalled();

        surface.destroy();

        // TargetPair has 2 internal RenderTargets → 2 textures + 2 FBOs deleted
        expect(fakeGl.deleteTexture).toHaveBeenCalledTimes(2);
        expect(fakeGl.deleteFramebuffer).toHaveBeenCalledTimes(2);

        void pair;
    });

    it('forgets a TargetPair that was explicitly destroyed before the surface', () => {
        const { surface, fakeGl } = createHarness();

        const pair = surface.createTargetPair(32, 32);
        pair.destroy();

        // 2 textures deleted by pair.destroy()
        expect(fakeGl.deleteTexture).toHaveBeenCalledTimes(2);

        const callsBefore = fakeGl.deleteTexture.mock.calls.length;
        surface.destroy();
        expect(fakeGl.deleteTexture).toHaveBeenCalledTimes(callsBefore);
    });

    it('reinitialises tracked TargetPairs on context restore', () => {
        const { surface, fakeGl, dispatch } = createHarness();

        surface.createTargetPair(32, 32);

        // 2 createTexture calls (a + b targets)
        expect(fakeGl.createTexture).toHaveBeenCalledTimes(2);

        dispatch('webglcontextrestored', {});

        // reinitialize() on pair recreates both internal targets → 4 total
        expect(fakeGl.createTexture).toHaveBeenCalledTimes(4);
        expect(fakeGl.createFramebuffer).toHaveBeenCalledTimes(4);
    });
});
