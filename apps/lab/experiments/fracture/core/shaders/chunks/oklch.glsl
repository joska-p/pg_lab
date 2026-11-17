// Shared GLSL chunk: OKLCH → sRGB.
//
// OKLCH is a perceptually uniform colour space (Lightness, Chroma, Hue).
// Mapping fractal data through it gives smoother, more "natural" palettes
// than HSV/RGB. The math is the standard OKLab → linear sRGB →
// sRGB-gamma transform. Previously duplicated 3× across the Mandelbrot
// pipelines (S5 dedup); canonical copy lives here.
vec3 oklchToRgb(vec3 oklch) {
    float L = oklch.x;
    float C = oklch.y;
    float H = oklch.z;

    float a = C * cos(H);
    float b = C * sin(H);

    float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    float s_ = L - 0.0894841775 * a - 1.291485548 * b;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    vec3 linearRgb;
    linearRgb.r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    linearRgb.g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    linearRgb.b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    vec3 lowPart = linearRgb * 12.92;
    vec3 highPart = 1.055 * pow(max(linearRgb, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    vec3 rgb = mix(highPart, lowPart, lessThanEqual(linearRgb, vec3(0.0031308)));
    return clamp(rgb, 0.0, 1.0);
}
