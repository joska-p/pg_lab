/**
 * Color spaces: how the raw channel triplet (each component in [-1, 1], the range every operator
 * preserves) maps to the sRGB value the framebuffer expects.
 *
 * The entry point of each space is named `ra_<id>`; `colorSpaceFunction` derives that name, so a
 * source cannot drift from its registry key.
 */
export interface ColorSpace {
    /** Name shown to the user. */
    readonly label: string;
    /** GLSL definition of `vec3 ra_<id>(vec3 raw)`, plus any helper it uses. */
    readonly source: string;
}

const OKLAB_TO_SRGB = `vec3 ra_oklabToSrgb(vec3 lab) {
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

export const colorSpaces = {
    srgb: {
        label: 'sRGB',
        source: `vec3 ra_srgb(vec3 raw) {
    return clamp(raw * 0.5 + 0.5, 0.0, 1.0);
}`,
    },
    oklch: {
        label: 'OKLCH',
        source: `${OKLAB_TO_SRGB}

vec3 ra_oklch(vec3 raw) {
    float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);
    float C = abs(raw.y) * 0.4;
    float h = (raw.z * 0.5 + 0.5) * 6.283185307179586;
    return ra_oklabToSrgb(vec3(L, C * cos(h), C * sin(h)));
}`,
    },
    oklab: {
        label: 'OKLab',
        source: `${OKLAB_TO_SRGB}

vec3 ra_oklab(vec3 raw) {
    float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);
    return ra_oklabToSrgb(vec3(L, raw.y * 0.4, raw.z * 0.4));
}`,
    },
    hsl: {
        label: 'HSL',
        source: `vec3 ra_hsl(vec3 raw) {
    float h = raw.x * 0.5 + 0.5;
    float s = abs(raw.y);
    float l = clamp(raw.z * 0.5 + 0.5, 0.0, 1.0);
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}`,
    },
} as const satisfies Record<string, ColorSpace>;

export type ColorSpaceId = keyof typeof colorSpaces;

export const COLOR_SPACE_IDS = Object.keys(colorSpaces) as readonly ColorSpaceId[];

export function isColorSpaceId(value: unknown): value is ColorSpaceId {
    return typeof value === 'string' && Object.hasOwn(colorSpaces, value);
}

/** Identifier of the entry point the compiled `main` ends with, e.g. `ra_oklch`. */
export function colorSpaceFunction(id: ColorSpaceId): string {
    return `ra_${id}`;
}

function clamp(v: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(max, v));
}

/** SRGB gamma encoding of a linear value. */
function encodeSrgb(linear: number): number {
    return linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.max(linear, 0) ** (1 / 2.4) - 0.055;
}

function oklabToSrgb(L: number, a: number, b: number): [number, number, number] {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    return [
        clamp(encodeSrgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
        clamp(encodeSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
        clamp(encodeSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
    ];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const chroma = 1 - Math.abs(2 * l - 1);
    const channel = (offset: number): number => {
        const k = Math.max(0, Math.min(1, Math.abs(((h * 6 + offset) % 6) - 3) - 1));
        return l + s * (k - 0.5) * chroma;
    };
    return [channel(0), channel(4), channel(2)];
}

/**
 * CPU reference implementation of the color space conversions. Must agree with the GLSL
 * implementations in `colorSpaces[id].source`.
 */
export function toSrgb(
    id: ColorSpaceId,
    raw: readonly [number, number, number],
): [number, number, number] {
    const [rx, ry, rz] = raw;

    switch (id) {
        case 'srgb': {
            const r = clamp(rx * 0.5 + 0.5);
            const g = clamp(ry * 0.5 + 0.5);
            const b = clamp(rz * 0.5 + 0.5);
            return [r, g, b];
        }
        case 'oklch': {
            const L = clamp(rx * 0.5 + 0.5, 0, 1);
            const C = Math.abs(ry) * 0.4;
            const h = (rz * 0.5 + 0.5) * 2 * Math.PI;
            return oklabToSrgb(L, C * Math.cos(h), C * Math.sin(h));
        }
        case 'oklab': {
            const L = clamp(rx * 0.5 + 0.5, 0, 1);
            return oklabToSrgb(L, ry * 0.4, rz * 0.4);
        }
        case 'hsl': {
            const h = rx * 0.5 + 0.5;
            const s = Math.abs(ry);
            const l = clamp(rz * 0.5 + 0.5, 0, 1);
            const [r, g, b] = hslToRgb(h, s, l);
            return [clamp(r), clamp(g), clamp(b)];
        }
    }
}
