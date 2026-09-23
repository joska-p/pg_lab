// Julia double-split body.
// Assembled via shaders/assemble.ts with chunks:
//   ds-arithmetic.glsl (ds_* bitwise canonical) + oklch.glsl + lighting.glsl.
//
// Same escape-time field as the double-split Mandelbrot body, except the
// iteration runs z <- z² + c with z0 = pixel position (DS center + delta)
// and a fixed c = ds_set(u_juliaRe, u_juliaIm) from the Controls panel.

// Fractal
uniform float u_iterationBase;
uniform float u_iterationScale;
uniform float u_iterationCap;
uniform float u_interiorScale;
uniform float u_pixelEps;
uniform float u_juliaRe;
uniform float u_juliaIm;

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
// Returns (continuous height, |z|² at exterior escape / min interior)
// ---------------------------------------------------------------------------
vec2 getJuliaData(vec2 uvCoord, int maxIter) {
    vec2 delta = (uvCoord - 0.5) * vec2(u_aspect, 1.0) * (3.0 / u_camera.z);

    // Pixel position in DS precision; the Julia constant fits in float32
    // so ds_set is exact enough for c.
    vec2 zr = ds_add(ds_set2(u_centerRe.x, u_centerRe.y), ds_set(delta.x));
    vec2 zi = ds_add(ds_set2(u_centerIm.x, u_centerIm.y), ds_set(delta.y));
    vec2 cr = ds_set(u_juliaRe);
    vec2 ci = ds_set(u_juliaIm);

    float minMod2 = 1e20;
    float mod2 = zr.x * zr.x + zi.x * zi.x;
    bool diverged = mod2 > 65536.0;
    int iterationCount = 0;

    // High bailout (256²) makes smooth iteration (nu) much smoother at depth
    for (int i = 0; i < maxIter; i++) {
        if (diverged) {
            break;
        }
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
    vec2 data0 = getJuliaData(vUv, maxIterations);
    float h0 = data0.x;

    // --- Analytic normal from the height field (lighting chunk) ---
    float heightScale = u_bumpHeight / max(u_camera.z, 1.0);
    vec3 normal = computeAnalyticNormal(h0, vUv, heightScale, pixelEps);
    float lightIntensity = computeLightIntensity(normal, u_sunAngle, u_ambient);

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
