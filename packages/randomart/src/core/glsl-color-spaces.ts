export type ColorSpaceId = 'srgb' | 'oklch' | 'oklab' | 'hsl';

const OKLCH_TO_SRGB_GLSL = `\
vec3 oklchToSrgb(vec3 oklch) {
  float L = oklch.x;
  float C = oklch.y;
  float h = oklch.z;
  float a = C * cos(h);
  float b = C * sin(h);
  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;
  vec3 linearRgb;
  linearRgb.r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  linearRgb.g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  linearRgb.b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  vec3 lo = linearRgb * 12.92;
  vec3 hi = 1.055 * pow(max(linearRgb, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
  return clamp(mix(hi, lo, lessThanEqual(linearRgb, vec3(0.0031308))), 0.0, 1.0);
}`;

const OKLAB_TO_SRGB_GLSL = `\
vec3 oklabToSrgb(vec3 oklab) {
  float L = oklab.x;
  float a = oklab.y;
  float b = oklab.z;
  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;
  vec3 linearRgb;
  linearRgb.r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  linearRgb.g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  linearRgb.b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  vec3 lo = linearRgb * 12.92;
  vec3 hi = 1.055 * pow(max(linearRgb, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
  return clamp(mix(hi, lo, lessThanEqual(linearRgb, vec3(0.0031308))), 0.0, 1.0);
}`;

const HSL_TO_SRGB_GLSL = `\
vec3 hslToSrgb(vec3 hsl) {
  float h = hsl.x / 360.0;
  float s = hsl.y / 100.0;
  float l = hsl.z / 100.0;
  vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}`;

const COLOR_SPACE_GLSL: Record<string, string> = {
    oklch: OKLCH_TO_SRGB_GLSL,
    oklab: OKLAB_TO_SRGB_GLSL,
    hsl: HSL_TO_SRGB_GLSL,
};

export function wrapWithColorSpaceConversion(rawExpr: string, colorSpace: ColorSpaceId): string {
    switch (colorSpace) {
        case 'oklch': {
            return `\
  vec3 _cs_raw = ${rawExpr};
  float _L = clamp(_cs_raw.x * 0.5 + 0.5, 0.0, 1.0);
  float _C = abs(_cs_raw.y) * 0.4;
  float _H = (_cs_raw.z * 0.5 + 0.5) * 6.28318;
  vec3 color = oklchToSrgb(vec3(_L, _C, _H));`;
        }
        case 'oklab': {
            return `\
  vec3 _cs_raw = ${rawExpr};
  float _L = clamp(_cs_raw.x * 0.5 + 0.5, 0.0, 1.0);
  float _a = _cs_raw.y * 0.4;
  float _b = _cs_raw.z * 0.4;
  vec3 color = oklabToSrgb(vec3(_L, _a, _b));`;
        }
        case 'hsl': {
            return `\
  vec3 _cs_raw = ${rawExpr};
  float _H = (_cs_raw.x * 0.5 + 0.5) * 360.0;
  float _S = abs(_cs_raw.y) * 100.0;
  float _L = clamp(_cs_raw.z * 0.5 + 0.5, 0.0, 1.0) * 100.0;
  vec3 color = hslToSrgb(vec3(_H, _S, _L));`;
        }
        // sRGB is the output space: no conversion, like the defensive default.
        case 'srgb':
        default: {
            return `  vec3 color = ${rawExpr};`;
        }
    }
}

export function getColorSpaceGlslFunction(colorSpace: ColorSpaceId): string {
    return COLOR_SPACE_GLSL[colorSpace] ?? '';
}
