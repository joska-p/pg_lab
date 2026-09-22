#version 300 es
precision highp float;

// Fractal
uniform float u_iterationBase;
uniform float u_iterationScale;
uniform float u_iterationCap;
uniform float u_interiorScale;
uniform float u_pixelEps;

// Lighting
uniform float u_sunAngle;
uniform float u_bumpHeight;
uniform float u_ambient;

// Color & Palette
uniform float u_hueShift;
uniform float u_hueFrequency;
uniform float u_chromaScale;

// View
uniform vec2 u_centerRe; // double-single pair (hi, lo)
uniform vec2 u_centerIm; // double-single pair (hi, lo)
uniform vec3 u_camera; // [x, y, zoom] — glaze built-in, y-down screen px
uniform float u_aspect;

in vec2 vUv;
out vec4 fragColor;

// ---------------------------------------------------------------------------
// Double-single (DS) arithmetic (No fma, uses bitwise splitting)
// ---------------------------------------------------------------------------

vec2 ds_set(float a) {
    return vec2(a, 0.0);
}

vec2 ds_set2(float hi, float lo) {
    return vec2(hi, lo);
}

// Standard TwoSum (order-independent)
vec2 ds_twoSum(float a, float b) {
    float s = a + b;
    float bv = s - a;
    float err = a - (s - bv) + (b - bv);
    return vec2(s, err);
}

vec2 ds_add(vec2 a, vec2 b) {
    vec2 s = ds_twoSum(a.x, b.x);
    s.y += a.y + b.y;
    return ds_twoSum(s.x, s.y);
}

vec2 ds_sub(vec2 a, vec2 b) {
    return ds_add(a, vec2(-b.x, -b.y));
}

// Bitwise Dekker split: splits a float into (hi, lo) where hi has the top
// 11 bits of the mantissa. Avoids the 8193.0 multiply and avoids `fma`.
// Works natively in ES 3.00 on all hardware.
vec2 ds_split(float a) {
    int bits = floatBitsToInt(a) & int(0xFFFFE000); // mask off lower 13 bits
    float hi = intBitsToFloat(bits);
    return vec2(hi, a - hi);
}

// Exact product error using bitwise splitting.
vec2 ds_mul(vec2 a, vec2 b) {
    vec2 as = ds_split(a.x);
    vec2 bs = ds_split(b.x);
    float hi = a.x * b.x;
    float lo = as.x * bs.x - hi + as.x * bs.y + as.y * bs.x + as.y * bs.y;

    // Add cross terms with the low parts of a and b
    lo = a.y * b.x + a.x * b.y + lo;

    // Renormalize
    return ds_twoSum(hi, lo);
}

// ---------------------------------------------------------------------------
// OKLCH → RGB
// ---------------------------------------------------------------------------
vec3 oklchToRgb(vec3 oklch) {
    float L = oklch.x;
    float C = oklch.y;
    float h = oklch.z;

    float a = C * cos(h);
    float b = C * sin(h);

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

// ---------------------------------------------------------------------------
// Returns (continuous height, |z|² at exterior escape / min interior)
// ---------------------------------------------------------------------------
vec2 getMandelbrotData(vec2 uvCoord, int maxIter) {
    vec2 delta = (uvCoord - 0.5) * vec2(u_aspect, 1.0) * (3.0 / u_camera.z);

    vec2 cr = ds_add(ds_set2(u_centerRe.x, u_centerRe.y), ds_set(delta.x));
    vec2 ci = ds_add(ds_set2(u_centerIm.x, u_centerIm.y), ds_set(delta.y));

    vec2 zr = vec2(0.0, 0.0);
    vec2 zi = vec2(0.0, 0.0);

    float minMod2 = 1e20;
    float mod2 = 0.0;
    bool diverged = false;
    int iterationCount = 0;

    // High bailout (256²) makes smooth iteration (nu) much smoother at depth
    for (int i = 0; i < maxIter; i++) {
        // Inlined z = z² + c
        vec2 zrSq = ds_mul(zr, zr);
        vec2 ziSq = ds_mul(zi, zi);
        vec2 zrzi = ds_mul(zr, zi);

        // 2 · zrzi: just scale the hi and lo parts, skip full ds_mul
        zr = ds_add(ds_sub(zrSq, ziSq), cr);
        zi = ds_add(vec2(zrzi.x * 2.0, zrzi.y * 2.0), ci);

        // Bailout & min-distance (reads hi parts only)
        mod2 = zr.x * zr.x + zi.x * zi.x;
        minMod2 = min(minMod2, mod2);

        if (mod2 > 65536.0) {
            diverged = true;
            iterationCount = i;
            break;
        }
    }

    if (diverged) {
        // Hardware log2 is much faster than log(x)/log(2)
        float log_zn = log2(mod2) * 0.5; // log2(|z|)
        float nu = log2(log_zn);
        float smooth_i = float(iterationCount) + 1.0 - nu;

        // mod2 is returned directly so the caller maps log₂(|z|²) itself
        return vec2(smooth_i, mod2);
    } else {
        // skip sqrt(minMod2): -log2(sqrt(x)) = -0.5 * log2(x)
        // 1e-24 is the squared equivalent of 1e-12
        float conv = -0.5 * log2(minMod2 + 1e-24) * 0.69314718056 * u_interiorScale;

        return vec2(conv, minMod2);
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
void main() {
    int maxIterations = int(
        u_iterationBase + log2(max(1.0, u_camera.z)) * 1.44269504089 * u_iterationScale
    );
    maxIterations = min(maxIterations, int(u_iterationCap));

    float pixelEps = u_pixelEps;

    // --- Evaluate the fractal ONLY ONCE per pixel ---
    vec2 data0 = getMandelbrotData(vUv, maxIterations);
    float h0 = data0.x;

    // --- Reconstruct normals analytically via screen-space derivatives ---
    vec2 dU = dFdx(vUv);
    vec2 dV = dFdy(vUv);
    float det = dU.x * dV.y - dU.y * dV.x;

    float dhdu = 0.0;
    float dhdv = 0.0;
    if (abs(det) > 1e-9) {
        float dhdx = dFdx(h0);
        float dhdy = dFdy(h0);
        dhdu = (dhdx * dV.y - dhdy * dU.y) / det;
        dhdv = (dU.x * dhdy - dV.x * dhdx) / det;
    }

    float heightScale = u_bumpHeight / max(u_camera.z, 1.0);

    vec3 normal = normalize(vec3(-dhdu * heightScale, -dhdv * heightScale, pixelEps));

    vec3 lightDir = normalize(vec3(cos(u_sunAngle), sin(u_sunAngle), 1.0));
    float diffuse = max(0.0, dot(normal, lightDir));
    float lightIntensity = clamp(u_ambient + diffuse * (1.0 - u_ambient), 0.0, 1.0);

    // -----------------------------------------------------------------
    // Color
    // -----------------------------------------------------------------
    float baseRate = log2(max(1.0, h0)) / log2(float(maxIterations));

    float L = clamp(baseRate * lightIntensity, 0.0, 1.0);

    float C;
    // data0.y is |z|² (squared), so the interior/exterior threshold is 4.0
    if (data0.y < 4.0) {
        // Interior
        C = clamp(h0 * 0.08 * u_chromaScale, 0.0, 0.35);
    } else {
        // Exterior: log2(sqrt(x)) = 0.5 * log2(x)
        C = clamp(0.5 * log2(max(1.0, data0.y)) * 0.69314718 * u_chromaScale, 0.0, 0.3);
    }

    float h = mod(h0 * u_hueFrequency + u_hueShift, 6.28318530718);

    fragColor = vec4(oklchToRgb(vec3(L, C, h)), 1.0);
}