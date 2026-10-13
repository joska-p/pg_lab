import { describe, expect, it, vi } from 'vite-plus/test';

import { compileProgram } from './compileProgram';
import { createProgram } from './Program';
import { ShaderError, catchShaderError } from './ShaderError';

const VERTEX_SHADER = 0x8b31;
const FRAGMENT_SHADER = 0x8b30;
const COMPILE_STATUS = 0x8b81;
const LINK_STATUS = 0x8b82;
const ACTIVE_UNIFORMS = 0x8b86;

interface MockOptions {
    failCompile?: 'vertex' | 'fragment';
    failLink?: boolean;
}

/** Minimal WebGL2 mock: enough for compile/link/destroy; model: StateBuffer.test.ts. */
function createMockGl(options: MockOptions = {}) {
    let failingType: number | null = null;
    if (options.failCompile === 'vertex') {
        failingType = VERTEX_SHADER;
    } else if (options.failCompile === 'fragment') {
        failingType = FRAGMENT_SHADER;
    }

    return {
        VERTEX_SHADER,
        FRAGMENT_SHADER,
        COMPILE_STATUS,
        LINK_STATUS,
        ACTIVE_UNIFORMS,
        createShader: vi.fn((type: number) => ({ type })),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn((shader: { type: number }) => shader.type !== failingType),
        getShaderInfoLog: vi.fn(() => 'ERROR: 0:1: boom'),
        deleteShader: vi.fn(),
        createProgram: vi.fn(() => ({})),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn((_program: unknown, pname: number) =>
            pname === ACTIVE_UNIFORMS ? 0 : !options.failLink,
        ),
        getProgramInfoLog: vi.fn(() => 'ERROR: link boom'),
        deleteProgram: vi.fn(),
        getActiveUniform: vi.fn(),
        getUniformLocation: vi.fn(),
        createVertexArray: vi.fn(() => ({})),
        deleteVertexArray: vi.fn(),
    };
}

type MockGl = ReturnType<typeof createMockGl>;

const asGl = (gl: MockGl) => gl as unknown as WebGL2RenderingContext;

function caught(run: () => unknown): unknown {
    try {
        run();
    } catch (error) {
        return error;
    }

    return undefined;
}

describe('compileProgram failures', () => {
    it('throws a fragment ShaderError carrying the driver log, and frees both shaders', () => {
        const gl = createMockGl({ failCompile: 'fragment' });
        const error = caught(() => compileProgram(asGl(gl), 'void main() {}'));

        expect(error).toBeInstanceOf(ShaderError);
        expect((error as ShaderError).stage).toBe('fragment');
        expect((error as ShaderError).log).toContain('boom');
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
        expect(gl.createProgram).not.toHaveBeenCalled();
    });

    it('throws a vertex ShaderError before touching the fragment stage', () => {
        const gl = createMockGl({ failCompile: 'vertex' });
        const error = caught(() => compileProgram(asGl(gl), 'void main() {}'));

        expect((error as ShaderError).stage).toBe('vertex');
        expect(gl.createShader).toHaveBeenCalledTimes(1);
        expect(gl.deleteShader).toHaveBeenCalledTimes(1);
    });

    it('throws a link ShaderError and frees the program and both shaders', () => {
        const gl = createMockGl({ failLink: true });
        const error = caught(() => compileProgram(asGl(gl), 'void main() {}'));

        expect((error as ShaderError).stage).toBe('link');
        expect(gl.deleteProgram).toHaveBeenCalledTimes(1);
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
    });

    it('frees the intermediate shaders on success', () => {
        const gl = createMockGl();
        const compiled = compileProgram(asGl(gl), 'void main() {}');

        expect(compiled.program).toBeDefined();
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
        expect(gl.deleteProgram).not.toHaveBeenCalled();
    });
});

describe('ShaderError', () => {
    it('truncates a huge driver log', () => {
        const error = new ShaderError('fragment', 'x'.repeat(10_000));

        expect(error.log.length).toBe(4000);
    });

    it('is still an Error', () => {
        expect(new ShaderError('link', 'nope')).toBeInstanceOf(Error);
    });
});

describe('catchShaderError', () => {
    it('wraps a successful result', () => {
        expect(catchShaderError(() => 42)).toEqual({ ok: true, value: 42 });
    });

    it('turns a ShaderError into a value', () => {
        const result = catchShaderError(() => {
            throw new ShaderError('fragment', 'bad');
        });

        expect(result.ok).toBe(false);
        expect(!result.ok && result.error.stage).toBe('fragment');
    });

    it('rethrows anything that is not a ShaderError', () => {
        expect(() =>
            catchShaderError(() => {
                throw new Error('real bug');
            }),
        ).toThrow('real bug');
    });
});

describe('Program destroy hook', () => {
    it('notifies the owner exactly once, even if destroyed twice', () => {
        const gl = createMockGl();
        const onDestroy = vi.fn();
        const program = createProgram(asGl(gl), 'void main() {}', undefined, onDestroy);

        program.destroy();
        program.destroy();

        expect(onDestroy).toHaveBeenCalledTimes(1);
        expect(onDestroy).toHaveBeenCalledWith(program);
        expect(gl.deleteProgram).toHaveBeenCalledTimes(1);
    });

    it('does not notify when compilation failed (nothing was created)', () => {
        const gl = createMockGl({ failCompile: 'fragment' });
        const onDestroy = vi.fn();

        expect(() => createProgram(asGl(gl), 'void main() {}', undefined, onDestroy)).toThrow(
            ShaderError,
        );
        expect(onDestroy).not.toHaveBeenCalled();
    });
});
