/**
 * Channels — how the generated expression becomes the color the shader writes.
 *
 * Two orthogonal axes, both carried by the grammar (they describe the image space, like the
 * vocabulary does) and travelling with it through serialization and the artwork provenance:
 *
 * - `space`: how the `(r, g, b)` triplet the expression produces is interpreted before output — plain
 *   sRGB, or a perceptual/cylindrical space (OKLCH, OKLab, HSL). The conversion is applied
 *   **once**, at the end of `main`: constant cost, independent of the expression size (no LUT).
 * - `shareDepth`: how deep the three channels share their structure. `0` = three independent trees
 *   (the historical model); `>= maxDepth` = a single tree, hence `r = g = b`. This is the
 *   correlation axis (uncorrelated ↔ correlated), replacing the old palette model.
 *
 * The identifiers are core data (part of the grammar); the GLSL is core text too — plain strings,
 * no DOM, no GPU — and the compiler owns only the call site.
 */

import { formatGlslFloat } from '../catalog/format.ts';
import { CONFIG } from '../config/index.ts';
import type { ChannelModel, ColorSpaceId } from './types.ts';

export type { ChannelModel, ColorSpaceId } from './types.ts';

export interface ColorSpace {
    readonly id: ColorSpaceId;
    /** Name shown in the UI. */
    readonly label: string;
    /**
     * Entry-point GLSL function name: `vec3 <fn>(vec3 raw)`. It takes the raw channel triplet (each
     * component in `[-1, 1]`, the range every catalog operator preserves) and returns the sRGB the
     * framebuffer expects. The remap from the raw field to the space's parameters and the
     * conversion to sRGB are both inlined.
     */
    readonly fn: string;
    /** Full GLSL definition of the entry point, plus any helper it uses. */
    readonly glsl: string;
}

/**
 * Raw triplet → sRGB, the identity space: exactly the historical "three channels in, RGB out"
 * behaviour. The `clamp` is boundary assurance only (the triplet is provably in `[-1, 1]`; the
 * compiler accepts any catalog, so it guards the edge of the render).
 */
const SRGB_GLSL = `vec3 ra_srgb(vec3 raw) {
    return clamp(raw * 0.5 + 0.5, 0.0, 1.0);
}`;

/**
 * OKLab → sRGB (Björn Ottosson): through the LMS cube roots, then the linear-RGB matrix and the
 * sRGB transfer function. Shared by the OKLCH and OKLab entry points — only one space is ever
 * emitted per shader, so the fixed helper name cannot collide.
 */
const OKLAB_TO_SRGB_GLSL = `vec3 ra_oklabToSrgb(vec3 lab) {
    float l_ = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
    float m_ = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
    float s_ = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;
    vec3 linear = vec3(
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
    vec3 lo = linear * 12.92;
    vec3 hi = 1.055 * pow(max(linear, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    return clamp(mix(hi, lo, lessThanEqual(linear, vec3(0.0031308))), 0.0, 1.0);
}`;

/**
 * The remaps, all from the raw triplet in `[-1, 1]`: lightness gets `x * 0.5 + 0.5`,
 * chroma/saturation `abs(y)`, and the hue is the third channel wrapped onto a full turn. These are
 * the coordinates the old color-space reference used
 * (`_TMP/oldy/randomart/src/core/glsl-color-spaces.ts`).
 */
const OKLCH_GLSL = `${OKLAB_TO_SRGB_GLSL}
vec3 ra_oklch(vec3 raw) {
    float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);
    float C = abs(raw.y) * ${formatGlslFloat(CONFIG.color.oklabChroma)};
    float h = (raw.z * 0.5 + 0.5) * 6.283185307179586;
    return ra_oklabToSrgb(vec3(L, C * cos(h), C * sin(h)));
}`;

const OKLAB_GLSL = `${OKLAB_TO_SRGB_GLSL}
vec3 ra_oklab(vec3 raw) {
    float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);
    return ra_oklabToSrgb(vec3(L, raw.y * ${formatGlslFloat(CONFIG.color.oklabChroma)}, raw.z * ${formatGlslFloat(CONFIG.color.oklabChroma)}));
}`;

const HSL_TO_SRGB_GLSL = `vec3 ra_hslToSrgb(vec3 hsl) {
    float h = hsl.x / 360.0;
    float s = hsl.y / 100.0;
    float l = hsl.z / 100.0;
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}`;

const HSL_GLSL = `${HSL_TO_SRGB_GLSL}
vec3 ra_hsl(vec3 raw) {
    float h = (raw.x * 0.5 + 0.5) * 360.0;
    float s = abs(raw.y) * 100.0;
    float l = clamp(raw.z * 0.5 + 0.5, 0.0, 1.0) * 100.0;
    return ra_hslToSrgb(vec3(h, s, l));
}`;

export const COLOR_SPACES = {
    srgb: { id: 'srgb', label: 'sRGB', fn: 'ra_srgb', glsl: SRGB_GLSL },
    oklch: { id: 'oklch', label: 'OKLCH', fn: 'ra_oklch', glsl: OKLCH_GLSL },
    oklab: { id: 'oklab', label: 'OKLab', fn: 'ra_oklab', glsl: OKLAB_GLSL },
    hsl: { id: 'hsl', label: 'HSL', fn: 'ra_hsl', glsl: HSL_GLSL },
} satisfies Record<ColorSpaceId, ColorSpace>;

export const COLOR_SPACE_IDS = Object.keys(COLOR_SPACES) as readonly ColorSpaceId[];

export function isColorSpaceId(value: unknown): value is ColorSpaceId {
    return typeof value === 'string' && Object.hasOwn(COLOR_SPACES, value);
}

/** The GLSL function name the compiled `main` ends with, e.g. `ra_oklch`. */
export function colorSpaceFunction(space: ColorSpaceId): string {
    return COLOR_SPACES[space].fn;
}

/** The GLSL definition block(s) the preamble must carry for this space. */
export function colorSpaceGlsl(space: ColorSpaceId): string {
    return COLOR_SPACES[space].glsl;
}

/** Depth floor of a shared trunk: `0` = three independent trees. */
export const MIN_SHARE_DEPTH = 0;

/**
 * The fallback of `createGrammar` when the caller says nothing: three independent channels in raw
 * sRGB — the plain model, exactly what a grammar built from parts did before channels existed.
 */
export const RAW_CHANNELS: ChannelModel = { space: 'srgb', shareDepth: MIN_SHARE_DEPTH };

/**
 * The app's default (`defaultGrammar`): a shared trunk of depth 2 read as OKLCH. Sharing the top of
 * the trees is what makes the three channels correlate, so the image reads as color following the
 * shape rather than as colored noise — a palette is no longer needed for that.
 */
export const DEFAULT_CHANNELS: ChannelModel = {
    space: CONFIG.channels.space,
    shareDepth: CONFIG.channels.shareDepth,
};
