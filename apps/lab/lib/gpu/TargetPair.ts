import type { Program } from './Program';
import { RenderTarget } from './RenderTarget';
import type { RenderTargetOptions } from './RenderTarget';
import type { UniformValue } from './types';

/** Called once when a TargetPair is explicitly destroyed — lets an owner stop tracking it. */
export type TargetPairDestroyHook = (pair: TargetPair) => void;

/**
 * A ping-pong pair of `RenderTarget`s for multi-pass simulations (cellular automata, fluids, etc.).
 *
 * Typical cycle: `targetPair.step(program, uniforms)` (reads from `.read`, renders into `.write`,
 * then swaps).
 */
export class TargetPair {
    readonly #gl: WebGL2RenderingContext;
    readonly #a: RenderTarget;
    readonly #b: RenderTarget;
    readonly #onDestroy: TargetPairDestroyHook | undefined;
    #pingPong = 0; // 0: read=a, write=b; 1: read=b, write=a
    #destroyed = false;

    constructor(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        options?: RenderTargetOptions,
        onDestroy?: TargetPairDestroyHook,
    ) {
        this.#gl = gl;
        this.#onDestroy = onDestroy;
        this.#a = new RenderTarget(gl, width, height, options);
        this.#b = new RenderTarget(gl, width, height, options);
    }

    get read(): RenderTarget {
        return this.#pingPong === 0 ? this.#a : this.#b;
    }

    get write(): RenderTarget {
        return this.#pingPong === 0 ? this.#b : this.#a;
    }

    get width(): number {
        return this.#a.width;
    }

    get height(): number {
        return this.#a.height;
    }

    /** Exchanges the read and write targets. */
    swap(): void {
        this.#pingPong = 1 - this.#pingPong;
    }

    /**
     * Executes one simulation pass: binds `write`, passes `uniforms` + `{ [inputSampler]:
     * read.texture }` to `program`, renders a fullscreen quad/triangle, unbinds, and swaps.
     */
    step(
        program: Program,
        extraUniforms?: Record<string, UniformValue>,
        inputSampler = 'u_state',
    ): void {
        const uniforms: Record<string, UniformValue> = {
            ...extraUniforms,
            [inputSampler]: this.read.texture,
        };

        this.write.bind();
        program.setUniforms(uniforms);
        program.render(this.width, this.height);
        this.write.unbind();
        this.swap();
    }

    /** Uploads raw RGBA bytes (width * height * 4) into both targets. */
    initPixels(rgba: Uint8Array): void {
        const gl = this.#gl;
        for (const target of [this.#a, this.#b]) {
            gl.bindTexture(gl.TEXTURE_2D, target.texture);
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

    /** Uploads a 1-byte per cell grid into both targets (R = state, G = 0, B = 0, A = 255). */
    initFromGrid(stateGrid: Uint8Array): void {
        const rgba = new Uint8Array(stateGrid.length * 4);
        for (let i = 0; i < stateGrid.length; i++) {
            const j = i * 4;
            rgba[j] = stateGrid[i] ?? 0;
            rgba[j + 1] = 0;
            rgba[j + 2] = 0;
            rgba[j + 3] = 255;
        }
        this.initPixels(rgba);
    }

    /** Resizes both targets. No-op if dimensions did not change. Resets ping-pong. */
    resize(width: number, height: number): void {
        this.#a.resize(width, height);
        this.#b.resize(width, height);
        this.#pingPong = 0;
    }

    /** Clears both targets to RGBA. */
    clear(r = 0, g = 0, b = 0, a = 0): void {
        this.#a.clear(r, g, b, a);
        this.#b.clear(r, g, b, a);
    }

    /**
     * Recreates the GPU textures and framebuffers after a WebGL context restore. Dimensions and
     * filter are preserved; content is lost (context loss always discards texture data).
     */
    reinitialize(): void {
        if (this.#destroyed) {
            return;
        }

        this.#a.reinitialize();
        this.#b.reinitialize();
    }

    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.#a.destroy();
        this.#b.destroy();
        this.#onDestroy?.(this);
    }
}
