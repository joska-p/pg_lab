import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { createGpuSurface } from './GpuSurface';
import { Program } from './shader/Program';

interface FakeCanvas {
    clientWidth: number;
    clientHeight: number;
    width: number;
    height: number;
    getContext: () => ReturnType<typeof createMockGl>;
    getBoundingClientRect: () => DOMRect;
    addEventListener: (type: string, listener: EventListener) => void;
    removeEventListener: (type: string, listener: EventListener) => void;
    dispatch: (type: string) => void;
}

/** Minimal WebGL2 mock: enough for surface construction, the shape batcher and programs. */
function createMockGl() {
    return {
        canvas: {},
        drawingBufferWidth: 300,
        drawingBufferHeight: 150,
        FRAMEBUFFER: 0x8d40,
        FRAMEBUFFER_COMPLETE: 0x8cd5,
        COLOR_ATTACHMENT0: 0x8ce0,
        COLOR_BUFFER_BIT: 0x4000,
        TEXTURE_2D: 0x0de1,
        RGBA8: 0x8058,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        NEAREST: 0x2600,
        CLAMP_TO_EDGE: 0x812f,
        VERTEX_SHADER: 0x8b31,
        FRAGMENT_SHADER: 0x8b30,
        COMPILE_STATUS: 0x8b81,
        LINK_STATUS: 0x8b82,
        ACTIVE_UNIFORMS: 0x8b86,
        TEXTURE0: 0x84c0,
        SAMPLER_2D: 0x8b5e,
        TRIANGLES: 0x0004,
        ARRAY_BUFFER: 0x8892,
        DYNAMIC_DRAW: 0x88e8,
        FLOAT: 0x1406,
        BLEND: 0x0be2,
        DEPTH_TEST: 0x0b71,
        SRC_ALPHA: 0x0302,
        ONE_MINUS_SRC_ALPHA: 0x0303,
        createShader: vi.fn(() => ({})),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        getShaderInfoLog: vi.fn(() => ''),
        deleteShader: vi.fn(),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn((_program: unknown, pname: number) =>
            pname === 0x8b86 ? 0 : true,
        ),
        getProgramInfoLog: vi.fn(() => ''),
        deleteProgram: vi.fn(),
        getActiveUniform: vi.fn(),
        getUniformLocation: vi.fn(() => ({})),
        createVertexArray: vi.fn(() => ({})),
        deleteVertexArray: vi.fn(),
        useProgram: vi.fn(),
        activeTexture: vi.fn(),
        bindTexture: vi.fn(),
        uniform1i: vi.fn(),
        uniformMatrix3fv: vi.fn(),
        isTexture: vi.fn(() => true),
        drawArrays: vi.fn(),
        createTexture: vi.fn(() => ({})),
        createFramebuffer: vi.fn(() => ({})),
        texImage2D: vi.fn(),
        texSubImage2D: vi.fn(),
        texParameteri: vi.fn(),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        checkFramebufferStatus: vi.fn(() => 0x8cd5),
        deleteTexture: vi.fn(),
        deleteFramebuffer: vi.fn(),
        viewport: vi.fn(),
        disable: vi.fn(),
        enable: vi.fn(),
        blendFunc: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        createBuffer: vi.fn(() => ({})),
        deleteBuffer: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        bindVertexArray: vi.fn(),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
    };
}

function createFakeCanvas(gl: ReturnType<typeof createMockGl>): FakeCanvas {
    const listeners = new Map<string, EventListener>();

    return {
        clientWidth: 300,
        clientHeight: 150,
        width: 0,
        height: 0,
        getContext: () => gl,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 150 }) as DOMRect,
        addEventListener: (type, listener) => {
            listeners.set(type, listener);
        },
        removeEventListener: (type) => {
            listeners.delete(type);
        },
        dispatch: (type) => {
            listeners.get(type)?.({ preventDefault: vi.fn() } as unknown as Event);
        },
    };
}

function createSurface() {
    const gl = createMockGl();
    const canvas = createFakeCanvas(gl);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const surface = createGpuSurface({ canvas: canvas as unknown as HTMLCanvasElement });

    return { gl, canvas, surface };
}

let priorWindow: unknown;

beforeEach(() => {
    const target = globalThis as Record<string, unknown>;

    priorWindow = target.window;
    target.window = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
});

afterEach(() => {
    const target = globalThis as Record<string, unknown>;

    if (priorWindow === undefined) {
        delete target.window;
    } else {
        target.window = priorWindow;
    }

    vi.restoreAllMocks();
});

describe('GpuSurface context restore signal', () => {
    it('follows isLost across the lost → restored pair', () => {
        const { canvas, surface } = createSurface();

        expect(surface.isLost).toBe(false);

        canvas.dispatch('webglcontextlost');
        expect(surface.isLost).toBe(true);

        canvas.dispatch('webglcontextrestored');
        expect(surface.isLost).toBe(false);
    });

    it('notifies listeners once, after StateBuffers have been reinitialized', () => {
        const { canvas, surface } = createSurface();
        const buffer = surface.createStateBuffer(8, 8);
        const order: string[] = [];

        vi.spyOn(buffer, 'reinitialize').mockImplementation(() => {
            order.push('buffer');
        });

        const listener = vi.fn(() => {
            order.push('listener');
        });

        surface.onContextRestored(listener);
        canvas.dispatch('webglcontextlost');
        canvas.dispatch('webglcontextrestored');

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(surface);
        expect(order).toEqual(['buffer', 'listener']);
    });

    it('stops notifying after unsubscribe', () => {
        const { canvas, surface } = createSurface();
        const listener = vi.fn();
        const unsubscribe = surface.onContextRestored(listener);

        unsubscribe();
        canvas.dispatch('webglcontextrestored');

        expect(listener).not.toHaveBeenCalled();
    });
});

describe('GpuSurface ownership', () => {
    it('forgets a StateBuffer destroyed before the surface', () => {
        const { gl, surface } = createSurface();
        const buffer = surface.createStateBuffer(8, 8);

        buffer.destroy();

        expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(2);
        expect(() => surface.destroy()).not.toThrow();
        // The early destroy already released the pair; the surface must not destroy it again.
        expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(2);
    });

    it('destroys every live program and buffer when the surface is destroyed', () => {
        const { surface } = createSurface();

        surface.createProgram('void main() {}');
        surface.createProgram('void main() {}');
        surface.createStateBuffer(8, 8);

        const destroyProgram = vi.spyOn(Program.prototype, 'destroy');

        expect(() => surface.destroy()).not.toThrow();
        expect(destroyProgram).toHaveBeenCalledTimes(2);
    });
});
