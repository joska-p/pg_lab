export interface RenderTargetOptions {
    readonly filter?: 'nearest' | 'linear';
}

/** Called once when the target is explicitly destroyed — lets an owner stop tracking it. */
export type RenderTargetDestroyHook = (target: RenderTarget) => void;

/** An offscreen RGBA8 texture attached to a private framebuffer. */
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

    get texture(): WebGLTexture {
        return this.#texture;
    }

    get framebuffer(): WebGLFramebuffer {
        return this.#fbo;
    }

    /** Binds this framebuffer and sets the viewport to target dimensions. */
    bind(): void {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#fbo);
        this.#gl.viewport(0, 0, this.#width, this.#height);
    }

    /** Restores the default screen framebuffer. */
    unbind(): void {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
    }

    /** Clears the target to RGBA. Temporarily binds this framebuffer. */
    clear(r = 0, g = 0, b = 0, a = 0): void {
        if (this.#destroyed) {
            return;
        }

        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#fbo);
        this.#gl.clearColor(r, g, b, a);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
    }

    /** Resizes the target. No-op if dimensions did not change. */
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
     * Recreates the GPU texture and framebuffer after a WebGL context restore. The dimensions and
     * filter are preserved; the new texture is blank (content is lost on context loss).
     */
    reinitialize(): void {
        if (this.#destroyed) {
            return;
        }

        const [texture, fbo] = RenderTarget.#createTarget(
            this.#gl,
            this.#width,
            this.#height,
            this.#filter,
        );
        this.#texture = texture;
        this.#fbo = fbo;
    }

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
        if (width <= 0 || height <= 0) {
            throw new Error(`RenderTarget: dimensions must be positive, got ${width}x${height}`);
        }

        const texture = gl.createTexture();
        if (!texture) {
            throw new Error('RenderTarget: texture creation failed');
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
            throw new Error('RenderTarget: framebuffer creation failed');
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(fbo);
            throw new Error(`RenderTarget: framebuffer incomplete (${width}x${height})`);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return [texture, fbo];
    }
}
