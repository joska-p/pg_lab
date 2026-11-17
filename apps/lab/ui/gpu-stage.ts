/*
 * Shared WebGL2 stage for experiments driven by a fragment shader.
 *
 * GpuSurface already owns the frame loop, DPR-aware resize, pointer tracking and
 * context restoration. This helper adds the program lifecycle: one compiled
 * program at a time, targeted uniform refreshes, play/pause and error reporting.
 * The canvas lives in static HTML and is never recreated.
 */

import { GpuSurface, ShaderError } from '../lib/surface/gpu/index';
import type { Program, UniformValue } from '../lib/surface/gpu/index';

export interface GpuStageOptions {
    fragment: string;
    uniforms?: () => Record<string, UniformValue>;
    onError?: (message: string) => void;
    onReady?: () => void;
}

function shaderMessage(error: unknown): string {
    if (error instanceof ShaderError) {
        return `Shader (${error.stage}) : ${error.log.trim() || error.message}`;
    }

    return error instanceof Error ? error.message : String(error);
}

export class GpuStage {
    readonly surface: GpuSurface;

    #uniforms: (() => Record<string, UniformValue>) | undefined;
    readonly #onError: ((message: string) => void) | undefined;
    readonly #onReady: (() => void) | undefined;

    #program: Program | null = null;
    #playing = false;
    #stopLoop: (() => void) | null = null;
    #destroyed = false;

    constructor(canvas: HTMLCanvasElement, options: GpuStageOptions) {
        this.surface = new GpuSurface(canvas);
        this.#uniforms = options.uniforms;
        this.#onError = options.onError;
        this.#onReady = options.onReady;
        this.setFragment(options.fragment);
    }

    get isPlaying(): boolean {
        return this.#playing;
    }

    /** Compiles a replacement program; a failure keeps the previous one alive. */
    setFragment(source: string): boolean {
        const result = this.surface.tryCreateProgram(source);

        if (!result.ok) {
            this.#onError?.(shaderMessage(result.error));
            return false;
        }

        this.#program?.destroy();
        this.#program = result.program;
        this.#onReady?.();
        this.renderOnce();
        return true;
    }

    setUniforms(provider: () => Record<string, UniformValue>): void {
        this.#uniforms = provider;
        this.renderOnce();
    }

    /** Paints one frame without starting the loop. */
    renderOnce(): void {
        if (this.#destroyed || !this.#program) {
            return;
        }

        let done = false;
        let stop: (() => void) | null = null;

        // FrameLoop ticks synchronously on subscribe; a mid-frame unsubscribe is safe.
        stop = this.surface.onFrame(() => {
            done = true;
            stop?.();
            stop = null;
            this.#paint();
        });
        if (done) {
            stop?.();
        }
    }

    setPlaying(next: boolean): void {
        if (this.#destroyed || this.#playing === next) {
            return;
        }

        this.#playing = next;
        this.#stopLoop?.();
        this.#stopLoop = null;

        if (next) {
            this.#stopLoop = this.surface.onFrame(() => {
                this.#paint();
            });
        }
    }

    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.setPlaying(false);
        this.#program?.destroy();
        this.#program = null;
        this.surface.destroy();
    }

    #paint(): void {
        const program = this.#program;

        if (!program) {
            return;
        }

        this.surface.renderProgram(program, this.#uniforms?.());
    }
}
