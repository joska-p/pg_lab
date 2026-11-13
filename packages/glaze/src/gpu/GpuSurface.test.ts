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

    it('isolates errors during resource reinitialization', () => {
        const { canvas, surface } = createSurface();
        const prog1 = surface.createProgram('void main() {}');
        const prog2 = surface.createProgram('void main() {}');
        const target = surface.createRenderTarget(16, 16);

        vi.spyOn(prog1, 'reinitialize').mockImplementation(() => {
            throw new Error('boom in program 1');
        });
        const reinitProg2 = vi.spyOn(prog2, 'reinitialize');
        const reinitTarget = vi.spyOn(target, 'reinitialize');
        const listener = vi.fn();
        surface.onContextRestored(listener);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        canvas.dispatch('webglcontextlost');
        canvas.dispatch('webglcontextrestored');

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Glaze: failed to reinitialize Program'),
            expect.any(Error),
        );
        expect(reinitProg2).toHaveBeenCalledTimes(1);
        expect(reinitTarget).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('isolates errors in restore listeners so subsequent listeners still run', () => {
        const { canvas, surface } = createSurface();
        const badListener = vi.fn(() => {
            throw new Error('listener failure');
        });
        const goodListener = vi.fn();

        surface.onContextRestored(badListener);
        surface.onContextRestored(goodListener);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        canvas.dispatch('webglcontextlost');
        canvas.dispatch('webglcontextrestored');

        expect(badListener).toHaveBeenCalledTimes(1);
        expect(goodListener).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Glaze: onContextRestored listener threw an error'),
            expect.any(Error),
        );
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

    it('forgets RenderTarget and RenderTargetPair destroyed before surface', () => {
        const { gl, surface } = createSurface();
        const target = surface.createRenderTarget(16, 16);
        const pair = surface.createRenderTargetPair(16, 16);

        target.destroy();
        pair.destroy();

        expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(3); // 1 for target, 2 for pair
        expect(() => surface.destroy()).not.toThrow();
        // Early destroy already released them, not destroyed again
        expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(3);
    });
});

describe('GpuSurface rendering', () => {
    it('renderProgramTo with target binds FBO and restores default framebuffer and viewport', () => {
        const { gl, surface } = createSurface();
        const program = surface.createProgram('void main() {}');
        const target = surface.createRenderTarget(50, 40);

        gl.bindFramebuffer.mockClear();
        gl.viewport.mockClear();

        surface.renderProgramTo(program, target);

        // target.bindFramebuffer binds the target FBO (FRAMEBUFFER: 0x8d40)
        expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, expect.anything());
        // renderProgramTo sets viewport to target size
        expect(gl.viewport).toHaveBeenCalledWith(0, 0, 50, 40);
        // And then restores default framebuffer (null) and default viewport (device dimensions)
        expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, null);
        expect(gl.viewport).toHaveBeenLastCalledWith(
            0,
            0,
            surface.deviceWidth,
            surface.deviceHeight,
        );
    });

    it('renderProgramTo with null target draws to default framebuffer', () => {
        const { gl, surface } = createSurface();
        const program = surface.createProgram('void main() {}');

        gl.bindFramebuffer.mockClear();
        gl.viewport.mockClear();

        surface.renderProgramTo(program, null);

        // Should not bind a custom FBO
        expect(gl.bindFramebuffer).not.toHaveBeenCalled();
        expect(gl.viewport).toHaveBeenCalledWith(0, 0, surface.deviceWidth, surface.deviceHeight);
    });

    it('renderProgramTo clears with specified color when clear option is provided', () => {
        const { gl, surface } = createSurface();
        const program = surface.createProgram('void main() {}');
        const target = surface.createRenderTarget(50, 40);

        gl.clearColor.mockClear();
        gl.clear.mockClear();

        surface.renderProgramTo(program, target, undefined, { clear: '#ff0000' });

        expect(gl.clearColor).toHaveBeenCalledWith(1, 0, 0, 1);
        expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
    });

    it('renderProgramTo disables and restores blend when blend: none', () => {
        const { gl, surface } = createSurface();
        const program = surface.createProgram('void main() {}');

        gl.disable.mockClear();
        gl.enable.mockClear();

        surface.renderProgramTo(program, null, undefined, { blend: 'none' });

        expect(gl.disable).toHaveBeenCalledWith(gl.BLEND);
        expect(gl.enable).toHaveBeenCalledWith(gl.BLEND);
    });
});
