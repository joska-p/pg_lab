// ============================================================
//  Julia Fragment Shader — bump-lit, OKLCH-coloured (body)
// ------------------------------------------------------------
//  Assembled via shaders/assemble.ts with chunks:
//    oklch.glsl (oklchToRgb) + lighting.glsl (computeLightIntensity).
//
//  Same field pipeline as the naive Mandelbrot body, except the
//  iteration runs z <- z² + c with z0 = pixel position and a fixed
//  c = vec2(u_juliaRe, u_juliaIm) from the Controls panel.
// ============================================================

// ---------- Named math constants (no more magic numbers) ----------
const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718; // 2π, used to wrap hue
const float LN_2 = 0.69314718056; // ln(2)
const float INV_LN_2 = 1.44269504089; // 1 / ln(2)  = log2(e)

// A point is considered "escaped" once |z|² > 4 (i.e. |z| > 2).
// Once |z| exceeds 2 it must diverge to infinity under z² + c.
const float ESCAPE_RADIUS_SQ = 4.0;

// Separate chroma ceilings for the interior vs exterior so each
// region can be tuned independently without blowing out saturation.
const float INTERIOR_MAX_CHROMA = 0.1;
const float EXTERIOR_MAX_CHROMA = 0.3;

// Tunable intensity for the interior convergence formula.
const float INTERIOR_INTENSITY = 15.0;

// Combined constant for the interior chroma ramp. The original was
// `h0 * 0.004 * u_chromaScale * 20.0`; we pre-multiply to 0.08.
const float INTERIOR_CHROMA_RATE = 0.08;

// ---------- Uniforms (inputs from the CPU / JS side) ----------

// Fractal
uniform float u_iterationBase; // baseline iteration count at zoom = 1
uniform float u_iterationScale; // how fast iterations grow with zoom
uniform float u_iterationCap; // hard ceiling (perf guard)
uniform float u_interiorScale; // multiplier on interior convergence
uniform float u_pixelEps; // finite-difference step in UV space
uniform float u_juliaRe; // Julia constant: real part
uniform float u_juliaIm; // Julia constant: imaginary part

// Lighting
uniform float u_sunAngle; // sun direction in the screen plane (radians)
uniform float u_bumpHeight; // overall bump strength
uniform float u_ambient; // ambient light term, [0..1]

// Colour & palette
uniform float u_hueShift; // rotates the whole hue wheel
uniform float u_hueFrequency; // how quickly hue cycles with height
uniform float u_chromaScale; // global saturation multiplier

// View
uniform vec3 u_camera; // [x, y, zoom] — glaze built-in, y-down screen px
uniform vec2 u_panOffset; // pan, in UV space, applied after zoom
uniform float u_aspect; // canvas width / height, for non-square canvases

// ---------- Varyings ----------
in vec2 vUv; // screen UV in [0,1]²
out vec4 fragColor; // final pixel colour

// ============================================================
//  Screen UV → complex-plane coordinate z0
// ------------------------------------------------------------
//  Same mapping as the naive Mandelbrot body: the UV square
//  [0,1]² maps onto [-2, +1] × [-1.5, +1.5], shifted left by 0.5.
//  For Julia this is the initial z, not the constant c.
// ============================================================
vec2 screenToComplex(vec2 uv) {
    vec2 centered = (uv - 0.5) / u_camera.z + 0.5 + u_panOffset;
    centered.x = (centered.x - 0.5) * u_aspect + 0.5;
    return (centered - 0.5) * 3.0 - vec2(0.5, 0.0);
}

// ============================================================
//  One Julia iteration step:  z <- z² + c
// ============================================================
vec2 iterateJulia(vec2 z, vec2 c) {
    return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
}

// ============================================================
//  Continuous height for EXTERIOR points (those that escaped)
// ============================================================
vec2 computeExteriorData(int iterationCount, vec2 z, float mod2) {
    float logMagnitude = 0.5 * log(mod2); // = log(|z|)
    float nu = log(logMagnitude / LN_2) / LN_2;
    float smoothIter = float(iterationCount) + 1.0 - nu;
    return vec2(smoothIter, length(z));
}

// ============================================================
//  Continuous height for INTERIOR points (those that didn't escape)
// ============================================================
vec2 computeInteriorData(float minMod2) {
    float closest = sqrt(minMod2);
    // +1e-12 guards against log(0) for the exact centre point
    float conv = -log(closest + 1e-12) * INTERIOR_INTENSITY * u_interiorScale;
    return vec2(conv, closest);
}

// ============================================================
//  Evaluate the Julia field for a single pixel
// ============================================================
vec2 getJuliaData(vec2 uv, int maxIter, vec2 c) {
    vec2 z = screenToComplex(uv);

    float minMod2 = 1e20; // smallest |z|² seen during the orbit
    float mod2 = dot(z, z); // current |z|²
    bool escaped = mod2 > ESCAPE_RADIUS_SQ;
    int escapeIter = 0;

    for (int i = 0; i < maxIter; i++) {
        if (escaped) {
            break;
        }
        z = iterateJulia(z, c);

        mod2 = dot(z, z);
        minMod2 = min(minMod2, mod2);

        if (mod2 > ESCAPE_RADIUS_SQ) {
            escaped = true;
            escapeIter = i;
            break;
        }
    }

    if (escaped) {
        return computeExteriorData(escapeIter, z, mod2);
    }
    return computeInteriorData(minMod2);
}

// ============================================================
//  Decide how many iterations to run at this zoom level
// ============================================================
int computeMaxIterations() {
    float logZoom = log2(max(1.0, u_camera.z));
    int iterations = int(u_iterationBase + logZoom * INV_LN_2 * u_iterationScale);
    return min(iterations, int(u_iterationCap));
}

// ============================================================
//  Estimate the surface normal via finite differences
// ============================================================
vec3 computeNormal(vec2 uv, int maxIter, float eps, float h0, vec2 c) {
    float hX = getJuliaData(uv + vec2(eps / max(u_aspect, 1e-6), 0.0), maxIter, c).x;
    float hY = getJuliaData(uv + vec2(0.0, eps), maxIter, c).x;

    float heightScale = u_bumpHeight / max(u_camera.z, 1.0);

    return normalize(
        vec3(
            (h0 - hX) * heightScale,
            (h0 - hY) * heightScale,
            eps // z-component is constant in pixel space
        )
    );
}

// ============================================================
//  OKLCH colour mapping (same as the naive Mandelbrot body)
// ============================================================
vec3 computeColor(vec2 juliaData, int maxIter, float lightIntensity) {
    float height = juliaData.x;
    float magnitude = juliaData.y;

    // Normalise height by maxIter so the brightness curve is
    // roughly zoom-independent (otherwise deeper zoom = brighter).
    float baseRate = log(max(1.0, height)) / log(float(maxIter));

    // --- Lightness ---
    float L = clamp(baseRate * lightIntensity, 0.0, 1.0);

    // --- Chroma (interior vs exterior) ---
    float C;
    if (magnitude < 2.0) {
        // Interior: height-driven, gentle ramp
        C = clamp(height * INTERIOR_CHROMA_RATE * u_chromaScale, 0.0, INTERIOR_MAX_CHROMA);
    } else {
        // Exterior: logarithmic so far-escapers don't blow out
        C = clamp(log(max(1.0, magnitude)) * u_chromaScale, 0.0, EXTERIOR_MAX_CHROMA);
    }

    // --- Hue (shared by both regions) ---
    float H = mod(height * u_hueFrequency + u_hueShift, TWO_PI);

    return oklchToRgb(vec3(L, C, H));
}

// ============================================================
//  Entry point
// ============================================================
void main() {
    int maxIter = computeMaxIterations();
    float eps = u_pixelEps;
    vec2 c = vec2(u_juliaRe, u_juliaIm);

    // 1. Evaluate the fractal field for this pixel
    vec2 juliaData = getJuliaData(vUv, maxIter, c);

    // 2. Build a normal from neighbouring samples and light it
    vec3 normal = computeNormal(vUv, maxIter, eps, juliaData.x, c);
    float lightIntensity = computeLightIntensity(normal, u_sunAngle, u_ambient);

    // 3. Map fractal + lighting to an OKLCH colour
    vec3 color = computeColor(juliaData, maxIter, lightIntensity);

    fragColor = vec4(color, 1.0);
}
