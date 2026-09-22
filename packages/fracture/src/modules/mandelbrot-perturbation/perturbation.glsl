// Perturbation Mandelbrot body.
// Assembled via shaders/assemble.ts with chunks:
//   ds-arithmetic.glsl (ds_add/ds_sub canonical + ds_mul_8193 historical +
//   ds_mul_float/cds_*/mod2_float) + oklch.glsl + lighting.glsl.

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
    vec2 d_re = ds_mul_8193(u_scale, ds_set(uvOff.x));
    vec2 d_im = ds_mul_8193(u_scale, ds_set(uvOff.y));

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

    // Analytic normal from the height field (lighting chunk)
    float heightScale = u_bumpHeight / max(u_camera.z, 1.0);
    vec3 normal = computeAnalyticNormal(h0, vUv, heightScale, pixelEps);
    float lightIntensity = computeLightIntensity(normal, u_sunAngle, u_ambient);

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
