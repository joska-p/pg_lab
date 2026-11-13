import { createPositiveInteger } from '../core/brands';
import { createStateData } from '../core/render';
import type { StateData } from '../core/render';
import { RenderTargetPair } from './RenderTargetPair';
import { createProgram } from './shader/Program';
import type { Program } from './shader/Program';
import type { UniformValue } from './shader/types';

/** Called once, when the buffer is destroyed — lets an owner (the surface) stop tracking it. */
export type StateBufferDestroyHook = (buffer: StateBuffer) => void;

export interface StateBufferProgramOptions {
    /** Sampler that receives the read texture on each step. Default: 'u_state'. */
    readonly inputUniform?: string;
}

interface ProgramEntry {
    readonly program: Program;
    readonly options?: StateBufferProgramOptions;
}

/** @deprecated Replaced by `RenderTargetPair`. */
export { RenderTargetPair as StateBufferTargets };

/**
 * Ping-pong texture pair holding evolving state, stepped by shader programs. Typical flow:
 * `init(data)` → `useProgram(name)` → `setUniforms(values)` → `step()`.
 */
// fallow-ignore-next-line unused-export -- public return type of createStateBuffer
export class StateBuffer {
    readonly #gl: WebGL2RenderingContext;
    readonly #pair: RenderTargetPair;
    readonly #programs = new Map<string, ProgramEntry>();
    readonly #onDestroy: StateBufferDestroyHook | undefined;
    #activeName: string | null = null;
    /** Values staged by `setUniforms`; re-applied on every step until overwritten. */
    #staged: Record<string, UniformValue> = {};
    #destroyed = false;

    constructor(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        onDestroy?: StateBufferDestroyHook,
    ) {
        this.#gl = gl;
        // Construct own pair without a surface hook so ownership remains with this StateBuffer.
        this.#pair = new RenderTargetPair(gl, width, height);
        this.#onDestroy = onDestroy;
    }

    get pair(): RenderTargetPair {
        return this.#pair;
    }

    /** @deprecated Use `pair` instead (`pair.read`, `pair.write`). */
    get targets(): RenderTargetPair {
        return this.#pair;
    }

    get width(): number {
        return this.#pair.width;
    }

    get height(): number {
        return this.#pair.height;
    }

    addProgram(name: string, fragmentSource: string, options?: StateBufferProgramOptions): void {
        const prior = this.#programs.get(name);

        if (prior) {
            prior.program.destroy();
        }

        this.#programs.set(name, {
            program: createProgram(this.#gl, fragmentSource),
            options,
        });
    }

    useProgram(name: string): void {
        if (!this.#programs.has(name)) {
            throw new Error(`Glaze: StateBuffer program "${name}" not found`);
        }

        this.#activeName = name;
    }

    /** Stages uniform values for the next and subsequent `step()` calls. */
    setUniforms(values: Record<string, UniformValue>): void {
        this.#staged = { ...this.#staged, ...values };
    }

    /**
     * Renders one pass from `pair.read` into `pair.write`, then swaps. Staged and per-step values
     * are merged into a single `Program.setUniforms` call, with the read texture bound last to the
     * configured `inputUniform` (default 'u_state') so it always wins over staged values.
     */
    step(uniforms?: Record<string, UniformValue>): void {
        const entry = this.#activeEntry();
        const inputUniform = entry.options?.inputUniform ?? 'u_state';

        entry.program.setUniforms({
            ...this.#staged,
            ...uniforms,
            [inputUniform]: this.#pair.read.texture,
        });
        entry.program.use();
        this.#pair.write.bindFramebuffer();
        this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 3);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        this.#pair.swap();
    }

    init(data: Uint8Array | StateData): void {
        createStateData(
            data,
            createPositiveInteger(this.width),
            createPositiveInteger(this.height),
        );

        const rgba = new Uint8Array(data.length * 4);

        for (let i = 0; i < data.length; i++) {
            const cell = data[i] ?? 0;
            const j = i * 4;

            rgba[j] = cell;
            rgba[j + 1] = 0;
            rgba[j + 2] = 0;
            rgba[j + 3] = 255;
        }

        const gl = this.#gl;

        for (const texture of [this.#pair.read.texture, this.#pair.write.texture]) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                0,
                0,
                this.width,
                this.height,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                rgba,
            );
        }
    }

    getTexture(): WebGLTexture {
        return this.#pair.read.texture;
    }

    resize(width: number, height: number): void {
        this.#pair.resize(width, height);
    }

    /** Recreates render targets and recompiles every program — the `webglcontextrestored` path. */
    reinitialize(): void {
        if (this.#destroyed) {
            return;
        }

        this.#pair.reinitialize();

        for (const entry of this.#programs.values()) {
            entry.program.reinitialize();
        }
    }

    /** Idempotent: releases own resources and notifies the surface exactly once. */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;

        for (const entry of this.#programs.values()) {
            entry.program.destroy();
        }

        this.#programs.clear();
        this.#staged = {};
        this.#pair.destroy();
        this.#onDestroy?.(this);
    }

    #activeEntry(): ProgramEntry {
        const entry = this.#programs.get(this.#activeName ?? 'default');

        if (!entry) {
            throw new Error(
                `Glaze: StateBuffer program "${this.#activeName ?? 'default'}" not found`,
            );
        }

        return entry;
    }
}

export function createStateBuffer(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    onDestroy?: StateBufferDestroyHook,
): StateBuffer {
    return new StateBuffer(gl, width, height, onDestroy);
}
