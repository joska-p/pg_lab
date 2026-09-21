import { createDocumentCanvas } from '../../core/environment';
import type { Point2D } from '../../core/geometry';
import { createCssColor } from '../../core/render';
import type { TextStyle } from '../../core/shapes';
import type { UniformValue } from '../shader/types';
import { colorArray } from './color';
import type { TextRaster } from './types';

/** @internal */
export const DEFAULT_FONT_FAMILY = 'sans-serif';

const MAX_TEXT_CACHE = 128;
const TEXT_SCALE = 2;

/** @internal */
export const textFragmentSource = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 out_color;
uniform vec2 u_resolution;
uniform vec3 u_camera;
uniform float u_dpr;
uniform vec2 u_position;
uniform vec2 u_size;
uniform sampler2D u_texture;
uniform vec4 u_color;

vec2 world() {
  vec2 frag = vUv * u_resolution;
  vec2 device = vec2(frag.x, u_resolution.y - frag.y);
  vec2 css = device / u_dpr;
  return (css - u_camera.xy) / u_camera.z;
}

void main() {
  vec2 w = world();
  vec2 local = (w - u_position) / u_size;
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) {
    out_color = vec4(0.0);
    return;
  }
  float a = texture(u_texture, local).a;
  out_color = vec4(u_color.rgb, u_color.a * a);
}
`.trim();

/** Rasterizes text to a texture via an offscreen canvas, at 2× size so edges stay crisp when scaled. */
export class TextRasterizer {
    readonly #gl: WebGL2RenderingContext;
    readonly #canvas: HTMLCanvasElement;
    readonly #context: CanvasRenderingContext2D;
    readonly #cache = new Map<string, TextRaster>();

    constructor(gl: WebGL2RenderingContext) {
        const canvas = createDocumentCanvas();
        const context = canvas?.getContext('2d');

        if (!canvas || !context) throw new Error('Glaze: offscreen text canvas unavailable');

        this.#gl = gl;
        this.#canvas = canvas;
        this.#context = context;
    }

    get(text: string, font: string, size: number): TextRaster {
        const key = `${text}|${font}`;
        const cached = this.#cache.get(key);

        if (cached) {
            this.#cache.delete(key);
            this.#cache.set(key, cached);

            return cached;
        }

        const context = this.#context;

        context.font = font;
        const width = Math.ceil(context.measureText(text).width);
        const height = Math.ceil(size * 1.4);

        this.#canvas.width = Math.max(1, Math.round(width * TEXT_SCALE));
        this.#canvas.height = Math.max(1, Math.round(height * TEXT_SCALE));
        context.setTransform(TEXT_SCALE, 0, 0, TEXT_SCALE, 0, 0);
        context.clearRect(0, 0, width, height);
        context.font = font;
        context.fillStyle = '#ffffff';
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';
        context.fillText(text, 0, size);

        const texture = this.#gl.createTexture();

        if (!texture) throw new Error('Glaze: text texture allocation failed');

        this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture);
        this.#gl.texImage2D(
            this.#gl.TEXTURE_2D,
            0,
            this.#gl.RGBA,
            this.#gl.RGBA,
            this.#gl.UNSIGNED_BYTE,
            this.#canvas,
        );
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR);
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR);
        this.#gl.texParameteri(
            this.#gl.TEXTURE_2D,
            this.#gl.TEXTURE_WRAP_S,
            this.#gl.CLAMP_TO_EDGE,
        );
        this.#gl.texParameteri(
            this.#gl.TEXTURE_2D,
            this.#gl.TEXTURE_WRAP_T,
            this.#gl.CLAMP_TO_EDGE,
        );

        const entry: TextRaster = { texture, width, height };

        this.#cache.set(key, entry);

        if (this.#cache.size > MAX_TEXT_CACHE) {
            const oldest = this.#cache.keys().next().value;

            if (oldest !== undefined) {
                const stale = this.#cache.get(oldest);

                if (stale) this.#gl.deleteTexture(stale.texture);

                this.#cache.delete(oldest);
            }
        }

        return entry;
    }

    clear(): void {
        for (const entry of this.#cache.values()) this.#gl.deleteTexture(entry.texture);

        this.#cache.clear();
    }

    destroy(): void {
        this.clear();
    }
}

export function textUniforms(
    position: Point2D,
    width: number,
    height: number,
    size: number,
    texture: WebGLTexture,
    style: TextStyle,
): Record<string, UniformValue> {
    return {
        u_position: [position.x, position.y - size],
        u_size: [width, height],
        u_texture: texture,
        u_color: colorArray(style.fill ?? createCssColor('#ffffff')),
    };
}
