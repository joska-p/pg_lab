import { compileProgram, FULLSCREEN_TRIANGLE } from './compileProgram';
import { setUniforms } from './setUniforms';
import type { CompiledShaderProgram, UniformEntry, UniformValue } from './types';

/** Called once, when the program is destroyed — lets an owner (the surface) stop tracking it. */
export type ProgramDestroyHook = (program: Program) => void;

/** A compiled program; call `destroy()` to release its GPU resources. */
export class Program {
    readonly #gl: WebGL2RenderingContext;
    readonly #fragmentSource: string;
    readonly #vertexSource: string;
    readonly #onDestroy: ProgramDestroyHook | undefined;
    #compiled: CompiledShaderProgram;
    #vao: WebGLVertexArrayObject | null;
    #nextTextureUnit = 0;
    #destroyed = false;

    constructor(
        gl: WebGL2RenderingContext,
        fragmentSource: string,
        vertexSource: string = FULLSCREEN_TRIANGLE,
        onDestroy?: ProgramDestroyHook,
    ) {
        this.#gl = gl;
        this.#fragmentSource = fragmentSource;
        this.#vertexSource = vertexSource;
        this.#onDestroy = onDestroy;
        this.#compiled = compileProgram(gl, fragmentSource, vertexSource);
        this.#vao = gl.createVertexArray();
    }

    get program(): WebGLProgram {
        return this.#compiled.program;
    }

    get uniforms(): Map<string, UniformEntry> {
        return this.#compiled.uniforms;
    }

    use(): void {
        this.#gl.useProgram(this.#compiled.program);
        this.#gl.bindVertexArray(this.#vao);
    }

    setUniforms(values: Record<string, UniformValue>): void {
        this.#gl.useProgram(this.#compiled.program);
        setUniforms(this.#gl, this.#compiled.uniforms, values, () => this.#nextTextureUnit++);
    }

    render(): void {
        this.#nextTextureUnit = 0;
        this.#gl.useProgram(this.#compiled.program);
        this.#gl.bindVertexArray(this.#vao);
        this.#gl.viewport(0, 0, this.#gl.drawingBufferWidth, this.#gl.drawingBufferHeight);
        this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 3);
    }

    reinitialize(): void {
        if (this.#destroyed) {
            return;
        }

        this.#gl.deleteProgram(this.#compiled.program);

        if (this.#vao) {
            this.#gl.deleteVertexArray(this.#vao);
        }

        this.#compiled = compileProgram(this.#gl, this.#fragmentSource, this.#vertexSource);
        this.#vao = this.#gl.createVertexArray();
    }

    /** Idempotent: releases GPU resources and notifies the owner exactly once. */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.#gl.deleteProgram(this.#compiled.program);

        if (this.#vao) {
            this.#gl.deleteVertexArray(this.#vao);
        }

        this.#vao = null;
        this.#onDestroy?.(this);
    }
}

export function createProgram(
    gl: WebGL2RenderingContext,
    fragmentSource: string,
    vertexSource?: string,
    onDestroy?: ProgramDestroyHook,
): Program {
    return new Program(gl, fragmentSource, vertexSource, onDestroy);
}
