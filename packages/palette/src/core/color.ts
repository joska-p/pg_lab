import type { Color, Oklch } from './types';

type Vector3 = readonly [number, number, number];
type Matrix3x3 = readonly [Vector3, Vector3, Vector3];

const RGB_MAX = 255;

// Matrices from CSS Color 4, using the same reference white (D65) as color.js.
const SRGB_TO_XYZ: Matrix3x3 = [
    [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
    [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
    [0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
];
const XYZ_TO_SRGB: Matrix3x3 = [
    [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
    [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
    [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
];
const XYZ_TO_LMS: Matrix3x3 = [
    [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
    [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
    [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
];
const LMS_TO_XYZ: Matrix3x3 = [
    [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
    [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
    [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
];
const LMS_TO_OKLAB: Matrix3x3 = [
    [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
    [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
    [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
];
const OKLAB_TO_LMS: Matrix3x3 = [
    [1, 0.3963377773761749, 0.2158037573099136],
    [1, -0.1055613458156586, -0.0638541728258133],
    [1, -0.0894841775298119, -1.2914855480194092],
];
const D65_TO_D50: Matrix3x3 = [
    [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
    [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
    [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
];
const D50_WHITE: Vector3 = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];

// Polar conversion thresholds derived from each space's reference chroma range.
const OKLAB_CHROMA_EPSILON = 0.8 / 100000;
const LAB_CHROMA_EPSILON = 250 / 100000;
const LAB_EPSILON = 216 / 24389;
const LAB_KAPPA = 24389 / 27;

function transform([x, y, z]: Vector3, matrix: Matrix3x3): Vector3 {
    return [
        x * matrix[0][0] + y * matrix[0][1] + z * matrix[0][2],
        x * matrix[1][0] + y * matrix[1][1] + z * matrix[1][2],
        x * matrix[2][0] + y * matrix[2][1] + z * matrix[2][2],
    ];
}

function cubeComponents([x, y, z]: Vector3): Vector3 {
    return [x ** 3, y ** 3, z ** 3];
}

function cubeRootComponents([x, y, z]: Vector3): Vector3 {
    return [Math.cbrt(x), Math.cbrt(y), Math.cbrt(z)];
}

function wrapHue(angle: number): number {
    return ((angle % 360) + 360) % 360;
}

function oklabToOklch([l, a, b]: Vector3): Color {
    if (Math.abs(a) < OKLAB_CHROMA_EPSILON && Math.abs(b) < OKLAB_CHROMA_EPSILON) {
        return { oklch: { l, c: 0, h: null } };
    }

    return {
        oklch: {
            l,
            c: Math.hypot(a, b),
            h: wrapHue((Math.atan2(b, a) * 180) / Math.PI),
        },
    };
}

function oklchToOklab({ l, c, h }: Oklch): Vector3 {
    const radians = ((h ?? 0) * Math.PI) / 180;

    return [l, c * Math.cos(radians), c * Math.sin(radians)];
}

function srgbToLinear(value: number): number {
    const sign = value < 0 ? -1 : 1;
    const magnitude = value * sign;

    return magnitude <= 0.04045 ? value / 12.92 : sign * ((magnitude + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number): number {
    const sign = value < 0 ? -1 : 1;
    const magnitude = value * sign;

    return magnitude > 0.0031308 ? sign * (1.055 * magnitude ** (1 / 2.4) - 0.055) : 12.92 * value;
}

function srgbToOklab([r, g, b]: Vector3): Vector3 {
    const linear: Vector3 = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
    const xyz = transform(linear, SRGB_TO_XYZ);

    return transform(cubeRootComponents(transform(xyz, XYZ_TO_LMS)), LMS_TO_OKLAB);
}

/** Raw sRGB components, possibly outside 0…1: no gamut mapping is applied. */
function oklabToSrgb([l, a, b]: Vector3): Vector3 {
    const lms = cubeComponents(transform([l, a, b], OKLAB_TO_LMS));
    const linear = transform(transform(lms, LMS_TO_XYZ), XYZ_TO_SRGB);

    return [linearToSrgb(linear[0]), linearToSrgb(linear[1]), linearToSrgb(linear[2])];
}

function hslToSrgb(h: number, s: number, l: number): Vector3 {
    const hue = wrapHue(h);
    const saturation = s / 100;
    const lightness = l / 100;

    function channel(n: number): number {
        const k = (n + hue / 30) % 12;
        const amplitude = saturation * Math.min(lightness, 1 - lightness);

        return lightness - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    }

    return [channel(0), channel(8), channel(4)];
}

const colorConverters = {
    oklab: (coords: Vector3): Color => oklabToOklch(coords),
    oklch: ([l, c, h]: Vector3): Color => ({ oklch: { l, c, h } }),
    hsl: ([h, s, l]: Vector3): Color => oklabToOklch(srgbToOklab(hslToSrgb(h, s, l))),
    srgb: (coords: Vector3): Color => oklabToOklch(srgbToOklab(coords)),
} as const;

/** Registry key of a space accepted by `createColor`. */
export type ColorSpaceId = keyof typeof colorConverters;

/** Build a color from coordinates in the space's native order. */
export function createColor(space: ColorSpaceId, coords: Vector3): Color {
    return colorConverters[space](coords);
}

/** Derive a new color with changes to its OKLCh coordinates. */
export function deriveColor(color: Color, patch: Partial<Oklch>): Color {
    return { oklch: { ...color.oklch, ...patch } };
}

/** Rotate hue by `degrees`, treating an achromatic hue as zero. */
export function rotateHue(color: Color, degrees: number): Color {
    return deriveColor(color, { h: wrapHue((color.oklch.h ?? 0) + degrees) });
}

/** Raw sRGB components in 0…1, for canvas pixels. */
export function srgbOf(color: Color): Vector3 {
    return oklabToSrgb(oklchToOklab(color.oklch));
}

function toPrecision(value: number, precision: number): number {
    if (value === 0) {
        return 0;
    }

    const integer = ~~value;
    const digits = integer === 0 ? 0 : ~~Math.log10(Math.abs(integer)) + 1;
    const multiplier = 10 ** (precision - digits);

    return Math.floor(value * multiplier + 0.5) / multiplier;
}

/** Serialize as CSS `lch()`, with the same significant-digit rule as color.js. */
export function serializeLchCss(color: Color, precision = 5): string {
    const xyzD65 = transform(
        cubeComponents(transform(oklchToOklab(color.oklch), OKLAB_TO_LMS)),
        LMS_TO_XYZ,
    );
    const d50 = transform(xyzD65, D65_TO_D50);
    const normalized: Vector3 = [
        d50[0] / D50_WHITE[0],
        d50[1] / D50_WHITE[1],
        d50[2] / D50_WHITE[2],
    ];
    const f: Vector3 = [
        normalized[0] > LAB_EPSILON
            ? Math.cbrt(normalized[0])
            : (LAB_KAPPA * normalized[0] + 16) / 116,
        normalized[1] > LAB_EPSILON
            ? Math.cbrt(normalized[1])
            : (LAB_KAPPA * normalized[1] + 16) / 116,
        normalized[2] > LAB_EPSILON
            ? Math.cbrt(normalized[2])
            : (LAB_KAPPA * normalized[2] + 16) / 116,
    ];
    const l = 116 * f[1] - 16;
    const a = 500 * (f[0] - f[1]);
    const b = 200 * (f[1] - f[2]);
    const achromatic = Math.abs(a) < LAB_CHROMA_EPSILON && Math.abs(b) < LAB_CHROMA_EPSILON;
    const chroma = achromatic ? 0 : Math.hypot(a, b);
    const hue = achromatic ? null : wrapHue((Math.atan2(b, a) * 180) / Math.PI);
    const hueText = hue === null ? 'none' : String(toPrecision(hue, precision));

    return `lch(${toPrecision(l, precision)}% ${toPrecision(chroma, precision)} ${hueText})`;
}

/** Map an sRGB component (0‥1) to a byte (0‥255). */
function scaleTo255(value: number): number {
    return Math.round(Math.max(0, value) * RGB_MAX);
}

export { scaleTo255 };
