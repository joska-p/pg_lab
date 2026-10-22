import type { ColorSpace } from './types';

/** Registry of color spaces, keyed by color space ID. */
export const colorSpaceRegistry = {
    srgb: {
        id: 'srgb',
        label: 'sRGB',
        fn: 'ra_srgb',
        glsl: `vec3 ra_srgb(vec3 raw) {
    return clamp(raw * 0.5 + 0.5, 0.0, 1.0);
}`,
    },
    oklch: {
        id: 'oklch',
        label: 'OKLCH',
        fn: 'ra_oklch',
        glsl: `vec3 ra_oklabToSrgb(vec3 lab) {
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
}
vec3 ra_oklch(vec3 raw) {
    float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);
    float C = abs(raw.y) * 0.4;
    float h = (raw.z * 0.5 + 0.5) * 6.283185307179586;
    return ra_oklabToSrgb(vec3(L, C * cos(h), C * sin(h)));
}`,
    },
    oklab: {
        id: 'oklab',
        label: 'OKLab',
        fn: 'ra_oklab',
        glsl: `vec3 ra_oklabToSrgb(vec3 lab) {
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
}
vec3 ra_oklab(vec3 raw) {
    float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);
    return ra_oklabToSrgb(vec3(L, raw.y * 0.4, raw.z * 0.4));
}`,
    },
    hsl: {
        id: 'hsl',
        label: 'HSL',
        fn: 'ra_hsl',
        glsl: `vec3 ra_hslToSrgb(vec3 hsl) {
    float h = hsl.x / 360.0;
    float s = hsl.y / 100.0;
    float l = hsl.z / 100.0;
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}
vec3 ra_hsl(vec3 raw) {
    float h = (raw.x * 0.5 + 0.5) * 360.0;
    float s = abs(raw.y) * 100.0;
    float l = clamp(raw.z * 0.5 + 0.5, 0.0, 1.0) * 100.0;
    return ra_hslToSrgb(vec3(h, s, l));
}`,
    },
} as const satisfies Record<string, ColorSpace>;

/** Opaque key into the color space registry. Inferred from the registry keys. */
export type ColorSpaceId = keyof typeof colorSpaceRegistry;

/** All known color space IDs as a readonly tuple. */
export const colorSpaceIds = Object.keys(colorSpaceRegistry) as readonly ColorSpaceId[];

/** Type of the color space registry (for internal use). */
export type ColorSpaceRegistry = typeof colorSpaceRegistry;
