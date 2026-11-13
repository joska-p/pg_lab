/** Called once, when the target is destroyed — lets an owner stop tracking it. */
export type RenderTargetDestroyHook = (target: RenderTarget) => void;

export interface RenderTargetOptions {
    /** Default: 'nearest'. Post-processing typically wants 'linear'. */
    readonly filter?: 'nearest' | 'linear';
}

/**
 * An offscreen RGBA8 texture + private framebuffer. Consumers sample `.texture`; `glaze` owns the
 * framebuffer and manages bind/viewport through `GpuSurface.renderProgramTo`.
 */
export class RenderTarget {
    readonly #gl: WebGL2RenderingContext;
    readonly #filter: 'nearest' | 'linear';
    readonly #onDestroy: RenderTargetDestroyHook | undefined;
    #width: number;
    #height: number;
    #texture: WebGLTexture;
    #fbo: WebGLFramebuffer;
    #destroyed = false;

    constructor(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        options?: RenderTargetOptions,
        onDestroy?: RenderTargetDestroyHook,
    ) {
        this.#gl = gl;
        this.#filter = options?.filter ?? 'nearest';
        this.#onDestroy = onDestroy;
        this.#width = width;
        this.#height = height;
        const [texture, fbo] = RenderTarget.#createTarget(gl, width, height, this.#filter);
        this.#texture = texture;
        this.#fbo = fbo;
    }

    get width(): number {
        return this.#width;
    }

    get height(): number {
        return this.#height;
    }

    /** Sample this texture from a shader. The framebuffer stays internal to glaze. */
    get texture(): WebGLTexture {
        return this.#texture;
    }

    /** Internal — used by `GpuSurface.renderProgramTo` and `RenderTargetPair.step`. */
    bindFramebuffer(): void {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#fbo);
        this.#gl.viewport(0, 0, this.#width, this.#height);
    }

    /**
     * Resizes the target. No-op when dimensions are unchanged (avoids recreating GPU objects every
     * frame for screen-sized targets).
     */
    resize(width: number, height: number): void {
        if (width === this.#width && height === this.#height) {
            return;
        }

        this.#destroyTarget();
        const [texture, fbo] = RenderTarget.#createTarget(this.#gl, width, height, this.#filter);
        this.#texture = texture;
        this.#fbo = fbo;
        this.#width = width;
        this.#height = height;
    }

    /**
     * Recreates the texture and FBO at the current size — the context-restore path where `resize(w,
     * h)` with identical dims would early-return and leave dead GL objects behind.
     */
    reinitialize(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyTarget();
        const [texture, fbo] = RenderTarget.#createTarget(
            this.#gl,
            this.#width,
            this.#height,
            this.#filter,
        );
        this.#texture = texture;
        this.#fbo = fbo;
    }

    /** Clears the target to a CSS color (or black). Temporarily binds and unbinds the FBO. */
    clear(r = 0, g = 0, b = 0, a = 0): void {
        if (this.#destroyed) {
            return;
        }

        const gl = this.#gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#fbo);
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /** Idempotent: releases GPU resources and notifies the owner exactly once. */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        this.#destroyed = true;
        this.#destroyTarget();
        this.#onDestroy?.(this);
    }

    #destroyTarget(): void {
        this.#gl.deleteTexture(this.#texture);
        this.#gl.deleteFramebuffer(this.#fbo);
    }

    static #createTarget(
        gl: WebGL2RenderingContext,
        width: number,
        height: number,
        filter: 'nearest' | 'linear',
    ): [WebGLTexture, WebGLFramebuffer] {
        const texture = gl.createTexture();

        if (!texture) {
            throw new Error('Glaze: RenderTarget texture creation failed');
        }

        const glFilter = filter === 'linear' ? gl.LINEAR : gl.NEAREST;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA8,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, glFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, glFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const fbo = gl.createFramebuffer();

        if (!fbo) {
            gl.deleteTexture(texture);
            throw new Error('Glaze: RenderTarget framebuffer creation failed');
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(fbo);
            throw new Error(
                `Glaze: RenderTarget framebuffer incomplete (${String(width)}x${String(height)})`,
            );
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return [texture, fbo];
    }
}

export function createRenderTarget(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    options?: RenderTargetOptions,
    onDestroy?: RenderTargetDestroyHook,
): RenderTarget {
    return new RenderTarget(gl, width, height, options, onDestroy);
}
