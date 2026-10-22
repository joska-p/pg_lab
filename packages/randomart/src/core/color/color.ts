/**
 * Channels — how the generated expression becomes the color the shader writes.
 *
 * Two orthogonal axes carried by the grammar:
 *
 * - `space`: interprets the `(r, g, b)` triplet (sRGB, OKLCH, OKLab, HSL). Applied once in `main`.
 * - `shareDepth`: channel structure sharing. `0` = independent trees; `>= maxDepth` = single tree.
 *   Correlation axis replacing the old palette model.
 */

import { formatGlslFloat } from '../catalog/format';
import { CONFIG } from '../config/config';
import type { ColorSpaceId } from '../config/types';
import type { ChannelModel } from './types';

export type { ChannelModel } from './types';

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

/** Raw triplet → sRGB (identity space). Clamp guards the render edge. */
const SRGB_GLSL = `vec3 ra_srgb(vec3 raw) {
    return clamp(raw * 0.5 + 0.5, 0.0, 1.0);
}`;

/** OKLab → sRGB (Ottosson). Shared helper for OKLCH/OKLab; one space per shader, no collision. */
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

/** Remaps from raw triplet `[-1,1]`: L = x*0.5+0.5, C = abs(y), h = z wrapped to full turn. */
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

/** GLSL function name the compiled `main` ends with (e.g., `ra_oklch`). */
export function colorSpaceFunction(space: ColorSpaceId): string {
    return COLOR_SPACES[space].fn;
}

/** GLSL definition block(s) the preamble must carry for this space. */
export function colorSpaceGlsl(space: ColorSpaceId): string {
    return COLOR_SPACES[space].glsl;
}

/** Depth floor of a shared trunk: `0` = three independent trees. */
export const MIN_SHARE_DEPTH = 0;

/** Compiler default channel model: independent channels in raw sRGB. Grammar always carries its own. */
export const RAW_CHANNELS: ChannelModel = { space: 'srgb', shareDepth: MIN_SHARE_DEPTH };
