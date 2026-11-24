/** Values captured from a real run: generate(default grammar, "42") then compile(..., "oklch"). */

export const DEFAULT_WEIGHTS: readonly (readonly [string, number])[] = [
    ['abs', 4],
    ['add', 6],
    ['const', 4],
    ['cos', 4],
    ['div', 2],
    ['gt', 2],
    ['max', 4],
    ['min', 4],
    ['mix', 4],
    ['mul', 6],
    ['neg', 2],
    ['select', 2],
    ['sin', 4],
    ['smax', 4],
    ['smin', 4],
    ['sqr', 4],
    ['warp', 2],
    ['x', 8],
    ['y', 8],
];

export const GRAMMAR_BOUNDS = {
    minDepth: 2,
    maxDepth: 5,
    maxNodes: 25,
    shareDepth: 2,
} as const;

export const FORMULAS = {
    r: 'add(max(cos(smax(k=0.5)(const(value=-0.574), x(amp=0.3, phase=1, cycles=1))), mix(y(amp=0.9, phase=1, cycles=4), x(amp=0.2, phase=0.7, cycles=4), mul(y(amp=0.9, phase=0.7, cycles=1), y(amp=0.8, phase=0.8, cycles=1)))), x(amp=0.3, phase=0.8, cycles=1))',
    g: 'add(max(x(amp=0.2, phase=0.9, cycles=3), add(abs(y(amp=0.4, phase=0.8, cycles=3)), x(amp=0.3, phase=0.8, cycles=1))), x(amp=0.3, phase=0.8, cycles=1))',
    b: 'add(max(mul(y(amp=0, phase=0.1, cycles=2), mul(const(value=-0.263), y(amp=0.2, phase=0.5, cycles=4))), abs(y(amp=0.6, phase=0.3, cycles=1))), x(amp=0.3, phase=0.8, cycles=1))',
} as const;

/** [draw index, kind, depth, budget, operator or parameter name, raw draw or final value] */
export type DrawEntry = readonly [number, 'op' | 'p', number | null, number | null, string, number];

export const DRAW_TRACE: readonly DrawEntry[] = [
    [1, 'op', 1, 25, 'add', 0.16827],
    [2, 'op', 2, 12, 'max', 0.28864],
    [3, 'op', 3, 5, 'cos', 0.18515],
    [4, 'op', 4, 4, 'smax', 0.62074],
    [5, 'p', null, null, 'smax.k', 0.5],
    [6, 'op', 5, 1, 'const', 0.19623],
    [7, 'p', null, null, 'const.value', -0.574],
    [8, 'op', 5, 2, 'x', 0.25945],
    [9, 'p', null, null, 'x.amp', 0.3],
    [10, 'p', null, null, 'x.phase', 1],
    [11, 'p', null, null, 'x.cycles', 1],
    [12, 'op', 3, 5, 'x', 0.88037],
    [13, 'p', null, null, 'x.amp', 0.2],
    [14, 'p', null, null, 'x.phase', 0.9],
    [15, 'p', null, null, 'x.cycles', 3],
    [16, 'op', 3, 5, 'mul', 0.48938],
    [17, 'op', 4, 2, 'y', 0.95122],
    [18, 'p', null, null, 'y.amp', 0],
    [19, 'p', null, null, 'y.phase', 0.1],
    [20, 'p', null, null, 'y.cycles', 2],
    [21, 'op', 4, 3, 'mul', 0.5085],
    [22, 'op', 5, 1, 'const', 0.05035],
    [23, 'p', null, null, 'const.value', -0.263],
    [24, 'op', 5, 1, 'y', 0.72016],
    [25, 'p', null, null, 'y.amp', 0.2],
    [26, 'p', null, null, 'y.phase', 0.5],
    [27, 'p', null, null, 'y.cycles', 4],
    [28, 'op', 3, 6, 'mix', 0.39615],
    [29, 'op', 4, 1, 'y', 0.82135],
    [30, 'p', null, null, 'y.amp', 0.9],
    [31, 'p', null, null, 'y.phase', 1],
    [32, 'p', null, null, 'y.cycles', 4],
    [33, 'op', 4, 2, 'x', 0.70135],
    [34, 'p', null, null, 'x.amp', 0.2],
    [35, 'p', null, null, 'x.phase', 0.7],
    [36, 'p', null, null, 'x.cycles', 4],
    [37, 'op', 4, 3, 'mul', 0.43821],
    [38, 'op', 5, 1, 'y', 0.92181],
    [39, 'p', null, null, 'y.amp', 0.9],
    [40, 'p', null, null, 'y.phase', 0.7],
    [41, 'p', null, null, 'y.cycles', 1],
    [42, 'op', 5, 1, 'y', 0.62105],
    [43, 'p', null, null, 'y.amp', 0.8],
    [44, 'p', null, null, 'y.phase', 0.8],
    [45, 'p', null, null, 'y.cycles', 1],
    [46, 'op', 3, 6, 'add', 0.12687],
    [47, 'op', 4, 2, 'abs', 0.02403],
    [48, 'op', 5, 1, 'y', 0.9256],
    [49, 'p', null, null, 'y.amp', 0.4],
    [50, 'p', null, null, 'y.phase', 0.8],
    [51, 'p', null, null, 'y.cycles', 3],
    [52, 'op', 4, 3, 'x', 0.77332],
    [53, 'p', null, null, 'x.amp', 0.3],
    [54, 'p', null, null, 'x.phase', 0.8],
    [55, 'p', null, null, 'x.cycles', 1],
    [56, 'op', 3, 6, 'abs', 0.01129],
    [57, 'op', 4, 5, 'y', 0.92303],
    [58, 'p', null, null, 'y.amp', 0.6],
    [59, 'p', null, null, 'y.phase', 0.3],
    [60, 'p', null, null, 'y.cycles', 1],
    [61, 'op', 2, 12, 'x', 0.88723],
    [62, 'p', null, null, 'x.amp', 0.3],
    [63, 'p', null, null, 'x.phase', 0.8],
    [64, 'p', null, null, 'x.cycles', 1],
];

export const COMPILE_STATS = {
    vertices: 28,
    contexts: 0,
    variables: 1,
    sourceLength: 2942,
} as const;

export const SHADER_SOURCE = `const float PI = 3.141592653589793;

float ra_smax(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
    return clamp(mix(b, a, h) + k * h * (1.0 - h), -1.0, 1.0);
}

// Single time hook. Change this function to alter the animation model.
float ra_phase() {
    return iTime / 60.0;
}

vec3 ra_oklabToLinear(vec3 lab) {
    float l_ = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
    float m_ = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
    float s_ = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;
    return vec3(
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

bool ra_inGamut(vec3 linear) {
    return all(greaterThanEqual(linear, vec3(0.0))) && all(lessThanEqual(linear, vec3(1.0)));
}

vec3 ra_oklabToSrgb(vec3 lab) {
    vec3 linear = ra_oklabToLinear(lab);
    if (!ra_inGamut(linear)) {
        // Out of sRGB: keep lightness and hue, reduce chroma until the color fits. Clipping each
        // channel independently would instead shift the hue.
        float scaleLo = 0.0;
        float scaleHi = 1.0;
        for (int i = 0; i < 12; i++) {
            float mid = 0.5 * (scaleLo + scaleHi);
            if (ra_inGamut(ra_oklabToLinear(vec3(lab.x, lab.y * mid, lab.z * mid)))) {
                scaleLo = mid;
            } else {
                scaleHi = mid;
            }
        }
        linear = ra_oklabToLinear(vec3(lab.x, lab.y * scaleLo, lab.z * scaleLo));
    }
    vec3 lo = linear * 12.92;
    vec3 hi = 1.055 * pow(max(linear, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    return clamp(mix(hi, lo, lessThanEqual(linear, vec3(0.0031308))), 0.0, 1.0);
}

vec3 ra_oklch(vec3 raw) {
    float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);
    float C = abs(raw.y) * 0.4;
    float h = (raw.z * 0.5 + 0.5) * 6.283185307179586;
    return ra_oklabToSrgb(vec3(L, C * cos(h), C * sin(h)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 v_p = fragCoord / iResolution.xy * 2.0 - 1.0;

    float u_phase = ra_phase();

    float v0 = mix(v_p.x, sin(2.0*PI*1.0*u_phase+PI*0.8), 0.3);

    fragColor = vec4(ra_oklch(vec3((((max((cos(PI*(ra_smax((-0.574),mix(v_p.x, sin(2.0*PI*1.0*u_phase+PI*1.0), 0.3),0.5)))),(mix(mix(v_p.y, sin(2.0*PI*4.0*u_phase+PI*1.0), 0.9),mix(v_p.x, sin(2.0*PI*4.0*u_phase+PI*0.7), 0.2),((mix(v_p.y, sin(2.0*PI*1.0*u_phase+PI*0.7), 0.9)*mix(v_p.y, sin(2.0*PI*1.0*u_phase+PI*0.8), 0.8))+1.0)*0.5))))+v0)*0.5), (((max(mix(v_p.x, sin(2.0*PI*3.0*u_phase+PI*0.9), 0.2),(((abs(mix(v_p.y, sin(2.0*PI*3.0*u_phase+PI*0.8), 0.4)))+v0)*0.5)))+v0)*0.5), (((max((v_p.y*((-0.263)*mix(v_p.y, sin(2.0*PI*4.0*u_phase+PI*0.5), 0.2))),(abs(mix(v_p.y, sin(2.0*PI*1.0*u_phase+PI*0.3), 0.6)))))+v0)*0.5))), 1.0);
}
`;
