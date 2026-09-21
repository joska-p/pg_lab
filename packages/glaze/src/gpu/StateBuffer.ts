import { createBufferDimension, createStateData, type StateData } from '../core/render';
import { createProgram, type Program } from './shader/Program';
import type { UniformValue } from './shader/types';

/** Ping-pong render targets; `swap()` exchanges the read and write roles. */
export class StateBufferTargets {
    readonly #gl: WebGL2RenderingContext;
    #pingPong = 0;
    #currentWidth: number;
    #currentHeight: number;
    #textures: WebGLTexture[] = [];
    #framebuffers: WebGLFramebuffer[] = [];

    constructor(gl: WebGL2RenderingContext, initialWidth: number, initialHeight: number) {
        this.#gl = gl;
        this.#currentWidth = initialWidth;
        this.#currentHeight = initialHeight;
        this.#createTargetPair(initialWidth, initialHeight);
    }

    get width(): number {
        return this.#currentWidth;
    }

    get height(): number {
        return this.#currentHeight;
    }

    bindWrite(): void {
        const fbo = this.#framebuffers[this.#writeIndex()];

        if (!fbo) throw new Error('Glaze: StateBuffer write target not initialized');

        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, fbo);
        this.#gl.viewport(0, 0, this.#currentWidth, this.#currentHeight);
    }

    unbind(): void {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
    }

    getReadTexture(): WebGLTexture {
        const texture = this.#textures[this.#readIndex()];

        if (!texture) throw new Error('Glaze: StateBuffer read target not initialized');

        return texture;
    }

    getWriteTexture(): WebGLTexture {
        const texture = this.#textures[this.#writeIndex()];

        if (!texture) throw new Error('Glaze: StateBuffer write target not initialized');

        return texture;
    }

    swap(): void {
        this.#pingPong = 1 - this.#pingPong;
    }

    init(data: Uint8Array | StateData): void {
        createStateData(
            data,
            createBufferDimension(this.#currentWidth),
            createBufferDimension(this.#currentHeight),
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

        for (const texture of this.#textures) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                0,
                0,
                this.#currentWidth,
                this.#currentHeight,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                rgba,
            );
        }
    }

    resize(width: number, height: number): void {
        if (width === this.#currentWidth && height === this.#currentHeight) return;

        this.#destroyTargetPair();
        this.#createTargetPair(width, height);
        this.#currentWidth = width;
        this.#currentHeight = height;
        this.#pingPong = 0;
    }

    /**
     * Recreates both render targets at the current dimensions — the context-restore path, where
     * `resize(w, h)` with identical dims would early-return and leave the dead GL textures behind.
     */
    reinitialize(): void {
        this.#destroyTargetPair();
        this.#createTargetPair(this.#currentWidth, this.#currentHeight);
        this.#pingPong = 0;
    }

    destroy(): void {
        this.#destroyTargetPair();
    }

    #createTarget(width: number, height: number): [WebGLTexture, WebGLFramebuffer] {
        const gl = this.#gl;
        const texture = gl.createTexture();

        if (!texture) {
            throw new Error('Glaze: StateBuffer texture creation failed');
        }

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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const fbo = gl.createFramebuffer();

        if (!fbo) {
            gl.deleteTexture(texture);
            throw new Error('Glaze: StateBuffer framebuffer creation failed');
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(fbo);
            throw new Error(
                `Glaze: StateBuffer framebuffer incomplete (${String(width)}x${String(height)})`,
            );
        }

        return [texture, fbo];
    }

    #createTargetPair(width: number, height: number): void {
        const gl = this.#gl;
        const created: [WebGLTexture, WebGLFramebuffer][] = [];

        try {
            created.push(this.#createTarget(width, height));
            created.push(this.#createTarget(width, height));
            this.#textures = created.map(([texture]) => texture);
            this.#framebuffers = created.map(([, fbo]) => fbo);
        } catch (error) {
            for (const [texture, fbo] of created) {
                gl.deleteTexture(texture);
                gl.deleteFramebuffer(fbo);
            }

            throw error;
        } finally {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    }

    #destroyTargetPair(): void {
        const gl = this.#gl;

        for (const texture of this.#textures) gl.deleteTexture(texture);

        for (const fbo of this.#framebuffers) gl.deleteFramebuffer(fbo);

        this.#textures = [];
        this.#framebuffers = [];
    }

    #writeIndex(): number {
        return this.#pingPong === 0 ? 0 : 1;
    }

    #readIndex(): number {
        return this.#pingPong === 0 ? 1 : 0;
    }
}

/**
 * Ping-pong texture pair holding evolving state, stepped by shader programs. Typical flow:
 * `init(data)` → `useProgram(name)` → `setUniforms(values)` → `step()`.
 */
// fallow-ignore-next-line unused-export -- public return type of createStateBuffer
export class StateBuffer {
    readonly #gl: WebGL2RenderingContext;
    readonly #targets: StateBufferTargets;
    readonly #programs = new Map<string, Program>();
    #activeName: string | null = null;

    constructor(gl: WebGL2RenderingContext, width: number, height: number) {
        this.#gl = gl;
        this.#targets = new StateBufferTargets(gl, width, height);
    }

    get targets(): StateBufferTargets {
        return this.#targets;
    }

    get width(): number {
        return this.#targets.width;
    }

    get height(): number {
        return this.#targets.height;
    }

    addProgram(name: string, fragmentSource: string): void {
        const prior = this.#programs.get(name);

        if (prior) prior.destroy();

        this.#programs.set(name, createProgram(this.#gl, fragmentSource));
    }

    useProgram(name: string): void {
        if (!this.#programs.has(name))
            throw new Error(`Glaze: StateBuffer program "${name}" not found`);

        this.#activeName = name;
    }

    setUniforms(values: Record<string, UniformValue>): void {
        this.#activeProgram().setUniforms(values);
    }

    step(): void {
        const program = this.#activeProgram();

        program.use();
        const gl = this.#gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.#targets.getReadTexture());
        this.#targets.bindWrite();
        const stateEntry = program.uniforms.get('u_state');

        if (stateEntry) {
            gl.uniform1i(stateEntry.location, 0);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        this.#targets.unbind();
        this.#targets.swap();
    }

    init(data: Uint8Array): void {
        this.#targets.init(data);
    }

    getTexture(): WebGLTexture {
        return this.#targets.getReadTexture();
    }

    resize(width: number, height: number): void {
        this.#targets.resize(width, height);
    }

    /** Recreates both render targets at the current dimensions — used on `webglcontextrestored`. */
    reinitialize(): void {
        this.#targets.reinitialize();
    }

    destroy(): void {
        for (const program of this.#programs.values()) {
            program.destroy();
        }

        this.#programs.clear();
        this.#targets.destroy();
    }

    #activeProgram(): Program {
        const program = this.#programs.get(this.#activeName ?? 'default');

        if (!program)
            throw new Error(
                `Glaze: StateBuffer program "${this.#activeName ?? 'default'}" not found`,
            );

        return program;
    }
}

export function createStateBuffer(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
): StateBuffer {
    return new StateBuffer(gl, width, height);
}
