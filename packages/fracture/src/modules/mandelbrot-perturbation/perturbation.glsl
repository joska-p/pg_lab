#version 300 es
precision highp float;

// Primary + secondary reference orbits
uniform sampler2D u_orbit;
uniform sampler2D u_orbit2;
uniform int u_orbitLength;
uniform int u_referenceIterations;
uniform int u_orbitLength2;
uniform int u_referenceIterations2;

// Fractal
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
uniform vec3 u_camera; // [x, y, zoom] — glaze built-in, y-down screen px
uniform vec2 u_scale; // DS (hi, lo)
uniform float u_aspect;

in vec2 vUv;
out vec4 fragColor;

// ---------------------------------------------------------------------------
// Double-single arithmetic
// ---------------------------------------------------------------------------
vec2 ds_set(float a) {
    return vec2(a, 0.0);
}

vec2 ds_add(vec2 a, vec2 b) {
    float t1 = a.x + b.x;
    float e = t1 - a.x;
    float t2 = b.x - e + (a.x - (t1 - e)) + a.y + b.y;
    float hi = t1 + t2;
    return vec2(hi, t2 - (hi - t1));
}

vec2 ds_sub(vec2 a, vec2 b) {
    float t1 = a.x - b.x;
    float e = t1 - a.x;
    float t2 = -b.x - e + (a.x - (t1 - e)) + a.y - b.y;
    float hi = t1 + t2;
    return vec2(hi, t2 - (hi - t1));
}

vec2 ds_mul(vec2 a, vec2 b) {
    const float split = 8193.0;
    float cona = a.x * split;
    float conb = b.x * split;
    float a1 = cona - (cona - a.x);
    float b1 = conb - (conb - b.x);
    float a2 = a.x - a1;
    float b2 = b.x - b1;

    float c11 = a.x * b.x;
    float c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));
    float c2 = a.x * b.y + a.y * b.x;

    float t1 = c11 + c2;
    float e = t1 - c11;
    float t2 = a.y * b.y + (c2 - e + (c11 - (t1 - e))) + c21;
    float hi = t1 + t2;
    return vec2(hi, t2 - (hi - t1));
}

vec2 ds_mul_float(vec2 a, float f) {
    float c11 = a.x * f;
    float c21 = a.y * f;
    float t1 = c11 + c21;
    float e = t1 - c11;
    float t2 = c21 - e + (c11 - (t1 - e));
    float hi = t1 + t2;
    return vec2(hi, t2 - (hi - t1));
}

void cds_mul(vec2 ar, vec2 ai, vec2 br, vec2 bi, out vec2 rr, out vec2 ri) {
    vec2 p0 = ds_mul(ar, br);
    vec2 p1 = ds_mul(ai, bi);
    vec2 p2 = ds_mul(ar, bi);
    vec2 p3 = ds_mul(ai, br);
    rr = ds_sub(p0, p1);
    ri = ds_add(p2, p3);
}

void cds_mul_Xn(vec2 X, vec2 dzr, vec2 dzi, out vec2 rr, out vec2 ri) {
    vec2 t0 = ds_mul_float(dzr, X.x);
    vec2 t1 = ds_mul_float(dzi, X.y);
    vec2 t2 = ds_mul_float(dzi, X.x);
    vec2 t3 = ds_mul_float(dzr, X.y);
    rr = ds_mul_float(ds_sub(t0, t1), 2.0);
    ri = ds_mul_float(ds_add(t2, t3), 2.0);
}

float mod2_float(vec2 z) {
    return dot(z, z);
}

// ---------------------------------------------------------------------------
// OKLCH → RGB
// ---------------------------------------------------------------------------
vec3 oklchToRgb(vec3 oklch) {
    float L = oklch.x,
        C = oklch.y,
        h = oklch.z;
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

    vec3 low = linearRgb * 12.92;
    vec3 high = 1.055 * pow(max(linearRgb, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    return clamp(mix(high, low, lessThanEqual(linearRgb, vec3(0.0031308))), 0.0, 1.0);
}

// ---------------------------------------------------------------------------
// Core iteration with optional secondary reference
// ---------------------------------------------------------------------------
vec2 runOrbit(sampler2D orbitTex, int orbitLen, int refIters, vec2 d_re, vec2 d_im) {
    vec2 dz_re = vec2(0.0);
    vec2 dz_im = vec2(0.0);

    float minMod2 = 1e20;
    float mod2 = 0.0;
    bool diverged = false;
    int iterationCount = 0;

    // Glitch threshold (Pauldelbrot / mathr style)
    const float GLITCH_FACTOR = 5e-4;

    for (int i = 0; i < 4096; i++) {
        if (i >= orbitLen || i >= refIters) break;

        vec2 Xn = texelFetch(orbitTex, ivec2(i, 0), 0).rg;

        // dz ← 2·X·dz + dz² + d
        vec2 termA_re, termA_im;
        cds_mul_Xn(Xn, dz_re, dz_im, termA_re, termA_im);

        vec2 termB_re, termB_im;
        cds_mul(dz_re, dz_im, dz_re, dz_im, termB_re, termB_im);

        dz_re = ds_add(ds_add(termA_re, termB_re), d_re);
        dz_im = ds_add(ds_add(termA_im, termB_im), d_im);

        // Reconstruct Z
        vec2 zFull;
        if (i + 1 < refIters) {
            vec2 Xnext = texelFetch(orbitTex, ivec2(i + 1, 0), 0).rg;
            zFull = Xnext + vec2(dz_re.x, dz_im.x);
        } else {
            zFull = Xn + vec2(dz_re.x, dz_im.x);
        }

        mod2 = mod2_float(zFull);
        minMod2 = min(minMod2, mod2);

        // ----- Glitch test -----
        // |Z|² < G · |X|²  →  the perturbation has become unreliable
        float Xmod2 = mod2_float(Xn);
        if (mod2 < GLITCH_FACTOR * Xmod2 && Xmod2 > 1e-12) {
            // optional: also treat very early escape of the reference as a glitch
            if (i + 2 < refIters) {
                return vec2(-1.0, 0.0);
            }
        }

        if (mod2 > 65536.0) {
            diverged = true;
            iterationCount = i;
            break;
        }
    }

    if (diverged) {
        float n = float(iterationCount) + 1.0;
        float log_r = 0.5 * log(mod2);
        float pot = exp(log_r - n * log(2.0));
        pot = max(pot, 1e-45);
        float height = -log2(pot);
        return vec2(height, mod2);
    } else {
        float conv = -0.5 * log2(minMod2 + 1e-30) * 0.69314718056 * u_interiorScale;
        return vec2(max(conv, 0.0), minMod2);
    }
}

vec2 getMandelbrotData(vec2 uvCoord) {
    vec2 uvOff = uvCoord - 0.5;
    uvOff.x *= u_aspect;
    vec2 d_re = ds_mul(u_scale, ds_set(uvOff.x));
    vec2 d_im = ds_mul(u_scale, ds_set(uvOff.y));

    // Try primary reference first
    vec2 res = runOrbit(u_orbit, u_orbitLength, u_referenceIterations, d_re, d_im);

    // If glitched, fall back to secondary reference
    if (res.x < 0.0) {
        res = runOrbit(u_orbit2, u_orbitLength2, u_referenceIterations2, d_re, d_im);
    }

    // Both references glitched on this pixel: with only two reference orbits we
    // have no reliable value to show. Rather than let the -1 sentinel leak into
    // main()'s OKLCH color math (which produced stray/garish pixels), fall back
    // to "deep interior" — height 0, tiny |Z|² — so the pixel reads as a calm
    // interior color instead of visual noise. Proper fix is adding more
    // reference orbits / a full glitch-correction pass.
    if (res.x < 0.0) {
        res = vec2(0.0, 0.0);
    }

    return res;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
void main() {
    float pixelEps = u_pixelEps;

    vec2 data0 = getMandelbrotData(vUv);
    float h0 = data0.x;

    // Analytical normals
    vec2 dU = dFdx(vUv);
    vec2 dV = dFdy(vUv);
    float det = dU.x * dV.y - dU.y * dV.x;

    float dhdu = 0.0,
        dhdv = 0.0;
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

    // Continuous-potential colouring
    float baseRate = clamp(h0 * 0.035, 0.0, 1.0);
    float L = clamp(baseRate * lightIntensity, 0.0, 1.0);

    float C;
    if (data0.y < 4.0) {
        C = clamp(h0 * 0.012 * u_chromaScale, 0.0, 0.32);
    } else {
        C = clamp(0.22 * u_chromaScale, 0.0, 0.28);
    }

    float h = mod(h0 * u_hueFrequency + u_hueShift, 6.28318530718);

    fragColor = vec4(oklchToRgb(vec3(L, C, h)), 1.0);
}
