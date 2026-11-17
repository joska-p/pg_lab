import { describe, expect, it, vi } from 'vite-plus/test';

import { buildStandardUniforms, setUniforms } from './setUniforms';
import type { UniformEntry, UniformValue } from './types';

// Mock WebGL2 context constants and calls
function createFakeGl() {
    return {
        FLOAT: 0x1406,
        INT: 0x1404,
        BOOL: 0x8b56,
        SAMPLER_2D: 0x8b5e,
        FLOAT_VEC2: 0x8b50,
        FLOAT_VEC3: 0x8b51,
        FLOAT_VEC4: 0x8b52,
        INT_VEC2: 0x8b53,
        INT_VEC3: 0x8b54,
        INT_VEC4: 0x8b55,
        BOOL_VEC2: 0x8b57,
        BOOL_VEC3: 0x8b58,
        BOOL_VEC4: 0x8b59,
        FLOAT_MAT2: 0x8b5a,
        FLOAT_MAT3: 0x8b5b,
        FLOAT_MAT4: 0x8b5c,
        TEXTURE_2D: 0x0de1,
        TEXTURE0: 0x84c0,
        uniform1f: vi.fn(),
        uniform1i: vi.fn(),
        uniform1fv: vi.fn(),
        uniform2fv: vi.fn(),
        uniform3fv: vi.fn(),
        uniform4fv: vi.fn(),
        uniform1iv: vi.fn(),
        uniform2iv: vi.fn(),
        uniform3iv: vi.fn(),
        uniform4iv: vi.fn(),
        uniformMatrix2fv: vi.fn(),
        uniformMatrix3fv: vi.fn(),
        uniformMatrix4fv: vi.fn(),
        activeTexture: vi.fn(),
        bindTexture: vi.fn(),
    } as unknown as WebGL2RenderingContext & {
        uniform1f: ReturnType<typeof vi.fn>;
        uniform1i: ReturnType<typeof vi.fn>;
        uniform1fv: ReturnType<typeof vi.fn>;
        uniform2fv: ReturnType<typeof vi.fn>;
        uniform3fv: ReturnType<typeof vi.fn>;
        uniform4fv: ReturnType<typeof vi.fn>;
        uniform1iv: ReturnType<typeof vi.fn>;
        uniform2iv: ReturnType<typeof vi.fn>;
        uniform3iv: ReturnType<typeof vi.fn>;
        uniform4iv: ReturnType<typeof vi.fn>;
        uniformMatrix2fv: ReturnType<typeof vi.fn>;
        uniformMatrix3fv: ReturnType<typeof vi.fn>;
        uniformMatrix4fv: ReturnType<typeof vi.fn>;
        activeTexture: ReturnType<typeof vi.fn>;
        bindTexture: ReturnType<typeof vi.fn>;
    };
}

function uniformEntry(location: WebGLUniformLocation, type: number, size = 1): UniformEntry {
    return { location, type, size };
}

describe('buildStandardUniforms', () => {
    it('constructs correct Shadertoy uniform dictionary', () => {
        const result = buildStandardUniforms({
            width: 800,
            height: 600,
            time: 12.5,
            timeDelta: 0.016,
            frame: 100,
            mouse: [100, 200, 100, 200],
        });

        expect(result).toEqual({
            iResolution: [800, 600, 1],
            iTime: 12.5,
            iTimeDelta: 0.016,
            iFrame: 100,
            iMouse: [100, 200, 100, 200],
        });
    });
});

describe('setUniforms', () => {
    it('sets scalar float and int/sampler uniforms', () => {
        const gl = createFakeGl();
        const locFloat = { name: 'u_float' } as unknown as WebGLUniformLocation;
        const locInt = { name: 'u_int' } as unknown as WebGLUniformLocation;
        const locSampler = { name: 'u_unit' } as unknown as WebGLUniformLocation;

        const uniforms = new Map<string, UniformEntry>([
            ['u_float', uniformEntry(locFloat, gl.FLOAT)],
            ['u_int', uniformEntry(locInt, gl.INT)],
            ['u_unit', uniformEntry(locSampler, gl.SAMPLER_2D)],
        ]);

        setUniforms(gl, uniforms, {
            u_float: 3.14,
            u_int: 42,
            u_unit: 2,
        });

        expect(gl.uniform1f).toHaveBeenCalledWith(locFloat, 3.14);
        expect(gl.uniform1i).toHaveBeenCalledWith(locInt, 42);
        expect(gl.uniform1i).toHaveBeenCalledWith(locSampler, 2);
    });

    it('sets vector uniforms with JS arrays', () => {
        const gl = createFakeGl();
        const locVec2 = { name: 'u_v2' } as unknown as WebGLUniformLocation;
        const locVec3 = { name: 'u_v3' } as unknown as WebGLUniformLocation;
        const locVec4 = { name: 'u_v4' } as unknown as WebGLUniformLocation;
        const locIVec2 = { name: 'u_iv2' } as unknown as WebGLUniformLocation;

        const uniforms = new Map<string, UniformEntry>([
            ['u_v2', uniformEntry(locVec2, gl.FLOAT_VEC2)],
            ['u_v3', uniformEntry(locVec3, gl.FLOAT_VEC3)],
            ['u_v4', uniformEntry(locVec4, gl.FLOAT_VEC4)],
            ['u_iv2', uniformEntry(locIVec2, gl.INT_VEC2)],
        ]);

        setUniforms(gl, uniforms, {
            u_v2: [1, 2],
            u_v3: [1, 2, 3],
            u_v4: [1, 2, 3, 4],
            u_iv2: [5, 6],
        });

        expect(gl.uniform2fv).toHaveBeenCalledWith(locVec2, expect.any(Float32Array));
        expect(gl.uniform3fv).toHaveBeenCalledWith(locVec3, expect.any(Float32Array));
        expect(gl.uniform4fv).toHaveBeenCalledWith(locVec4, expect.any(Float32Array));
        expect(gl.uniform2iv).toHaveBeenCalledWith(locIVec2, expect.any(Int32Array));
    });

    it('supports TypedArrays via ArrayBuffer.isView', () => {
        const gl = createFakeGl();
        const locVec3 = { name: 'u_v3' } as unknown as WebGLUniformLocation;
        const locMat4 = { name: 'u_m4' } as unknown as WebGLUniformLocation;

        const uniforms = new Map<string, UniformEntry>([
            ['u_v3', uniformEntry(locVec3, gl.FLOAT_VEC3)],
            ['u_m4', uniformEntry(locMat4, gl.FLOAT_MAT4)],
        ]);

        const f32Vec = new Float32Array([1.0, 2.0, 3.0]);
        const f32Mat = new Float32Array(16);
        f32Mat[0] = 1;

        setUniforms(gl, uniforms, {
            u_v3: f32Vec,
            u_m4: f32Mat,
        });

        expect(gl.uniform3fv).toHaveBeenCalledWith(locVec3, f32Vec);
        expect(gl.uniformMatrix4fv).toHaveBeenCalledWith(locMat4, false, f32Mat);
    });

    it('binds WebGLTexture to sampler2D and assigns consecutive texture units', () => {
        const gl = createFakeGl();
        const locTex0 = { name: 'u_tex0' } as unknown as WebGLUniformLocation;
        const locTex1 = { name: 'u_tex1' } as unknown as WebGLUniformLocation;

        const uniforms = new Map<string, UniformEntry>([
            ['u_tex0', uniformEntry(locTex0, gl.SAMPLER_2D)],
            ['u_tex1', uniformEntry(locTex1, gl.SAMPLER_2D)],
        ]);

        const texture0 = { _name: 'tex0' } as unknown as WebGLTexture;
        const texture1 = { _name: 'tex1' } as unknown as WebGLTexture;

        setUniforms(gl, uniforms, {
            u_tex0: texture0,
            u_tex1: texture1,
        });

        expect(gl.activeTexture).toHaveBeenNthCalledWith(1, gl.TEXTURE0);
        expect(gl.bindTexture).toHaveBeenNthCalledWith(1, gl.TEXTURE_2D, texture0);
        expect(gl.uniform1i).toHaveBeenNthCalledWith(1, locTex0, 0);

        expect(gl.activeTexture).toHaveBeenNthCalledWith(2, gl.TEXTURE0 + 1);
        expect(gl.bindTexture).toHaveBeenNthCalledWith(2, gl.TEXTURE_2D, texture1);
        expect(gl.uniform1i).toHaveBeenNthCalledWith(2, locTex1, 1);
    });

    it('ignores unknown uniform names and undefined values silently', () => {
        const gl = createFakeGl();
        const locFloat = { name: 'u_float' } as unknown as WebGLUniformLocation;

        const uniforms = new Map<string, UniformEntry>([
            ['u_float', uniformEntry(locFloat, gl.FLOAT)],
        ]);

        expect(() => {
            setUniforms(gl, uniforms, {
                u_float: undefined as unknown as UniformValue,
                u_unknown: 42,
            });
        }).not.toThrow();

        expect(gl.uniform1f).not.toHaveBeenCalled();
    });
});
