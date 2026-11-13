import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { Program } from './shader/Program';
import { createStateBuffer } from './StateBuffer';

/** Minimal WebGL2 mock: texture/FBO lifecycle plus enough shader plumbing for `Program`. */
function createMockGl() {
    return {
        createTexture: vi.fn(() => ({})),
        createFramebuffer: vi.fn(() => ({})),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texSubImage2D: vi.fn(),
        texParameteri: vi.fn(),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        viewport: vi.fn(),
        checkFramebufferStatus: vi.fn(() => 0x8cd5), // FRAMEBUFFER_COMPLETE
        deleteTexture: vi.fn(),
        deleteFramebuffer: vi.fn(),
        FRAMEBUFFER: 0x8d40,
        FRAMEBUFFER_COMPLETE: 0x8cd5,
        COLOR_ATTACHMENT0: 0x8ce0,
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
        getUniformLocation: vi.fn(),
        createVertexArray: vi.fn(() => ({})),
        deleteVertexArray: vi.fn(),
        bindVertexArray: vi.fn(),
        useProgram: vi.fn(),
        activeTexture: vi.fn(),
        uniform1i: vi.fn(),
        isTexture: vi.fn(() => true),
        drawArrays: vi.fn(),
    };
}

type MockGl = ReturnType<typeof createMockGl>;

/**
 * Le mock WebGL2 n'implémente que le cycle texture/FBO utilisé par le buffer : l'assertion est
 * confinée à cette factory.
 */
function createBuffer(gl: MockGl) {
    return createStateBuffer(gl as unknown as WebGL2RenderingContext, 100, 100);
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('StateBuffer target lifecycle', () => {
    it('keeps the target pair when resize() is called with identical dimensions', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);
        const created = gl.createTexture.mock.calls.length;

        buffer.resize(100, 100);

        expect(gl.createTexture.mock.calls.length).toBe(created);
    });

    it('recreates the target pair when resize() changes dimensions', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);
        const created = gl.createTexture.mock.calls.length;

        buffer.resize(200, 100);

        expect(gl.createTexture.mock.calls.length).toBe(created + 2);
    });

    it('reinitialize() forces a new target pair at current dimensions (context-restore fix)', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);
        const created = gl.createTexture.mock.calls.length;

        // The restore path reinitializes at the *same* dimensions; resize() alone would no-op.
        buffer.reinitialize();

        expect(gl.createTexture.mock.calls.length).toBe(created + 2);
    });
});

describe('StateBuffer program restore', () => {
    it('reinitialize() recreates the pair and recompiles every program', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);

        buffer.addProgram('default', 'void main() {}');
        buffer.addProgram('paint', 'void main() {}');

        const reinitialize = vi.spyOn(Program.prototype, 'reinitialize');
        const createdTextures = gl.createTexture.mock.calls.length;

        buffer.reinitialize();

        expect(reinitialize).toHaveBeenCalledTimes(2);
        expect(gl.createTexture.mock.calls.length).toBe(createdTextures + 2);
    });
});

describe('StateBuffer ownership', () => {
    it('destroy() notifies the owner exactly once, even if called twice', () => {
        const gl = createMockGl();
        const onDestroy = vi.fn();

        const buffer = createStateBuffer(
            gl as unknown as WebGL2RenderingContext,
            100,
            100,
            onDestroy,
        );

        buffer.destroy();
        buffer.destroy();

        expect(onDestroy).toHaveBeenCalledTimes(1);
        expect(onDestroy).toHaveBeenCalledWith(buffer);
        expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(2);
    });

    it('destroy() releases its programs', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);

        buffer.addProgram('default', 'void main() {}');

        const destroy = vi.spyOn(Program.prototype, 'destroy');

        buffer.destroy();

        expect(destroy).toHaveBeenCalledTimes(1);
    });
});

describe('StateBuffer stepping', () => {
    it('merges staged and per-step uniforms into one setUniforms call', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);

        buffer.addProgram('default', 'void main() {}');
        buffer.useProgram('default');

        const setUniforms = vi
            .spyOn(Program.prototype, 'setUniforms')
            .mockImplementation(() => undefined);

        buffer.setUniforms({ u_value: 1 });
        buffer.step({ u_extra: 2 });
        buffer.step({ u_extra: 3 });

        expect(setUniforms).toHaveBeenCalledTimes(2);
        expect(setUniforms.mock.calls[0]).toEqual([
            { u_value: 1, u_extra: 2, u_state: expect.anything() },
        ]);
        expect(setUniforms.mock.calls[1]).toEqual([
            { u_value: 1, u_extra: 3, u_state: expect.anything() },
        ]);
    });

    it('draws the read texture into the write target, then swaps', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);

        buffer.addProgram('default', 'void main() {}');
        buffer.useProgram('default');
        vi.spyOn(Program.prototype, 'setUniforms').mockImplementation(() => undefined);

        const readBefore = buffer.pair.read.texture;

        buffer.step();

        expect(buffer.pair.read.texture).not.toBe(readBefore);
        expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, null);
        expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
    });

    it('binds configured inputUniform to pair.read.texture', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);

        buffer.addProgram('custom', 'void main() {}', { inputUniform: 'u_previous' });
        buffer.useProgram('custom');

        const setUniforms = vi
            .spyOn(Program.prototype, 'setUniforms')
            .mockImplementation(() => undefined);

        buffer.step();

        expect(setUniforms).toHaveBeenCalledWith(
            expect.objectContaining({
                u_previous: buffer.pair.read.texture,
            }),
        );
    });
});
