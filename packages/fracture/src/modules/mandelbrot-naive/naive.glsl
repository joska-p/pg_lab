#version 300 es
precision highp float;

// ============================================================
//  Mandelbrot Fragment Shader — bump-lit, OKLCH-coloured
// ------------------------------------------------------------
//  Pipeline per pixel:
//    1. Evaluate the Mandelbrot field at this UV
//       (exterior: smooth iteration count; interior: convergence)
//    2. Estimate a surface normal from 3 nearby samples
//       (finite differences of the height field)
//    3. Apply simple Lambertian + ambient lighting
//    4. Map the result to an OKLCH colour and convert to sRGB
//
//  Reading order for juniors:
//    constants → uniforms → oklchToRgb → screenToComplex →
//    iterateMandelbrot → computeExterior/InteriorData →
//    getMandelbrotData → computeMaxIterations → computeNormal →
//    computeLightIntensity → computeColor → main
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
// The original code found 12–20 to look good; 15 is the default.
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
//  OKLCH → sRGB
// ------------------------------------------------------------
//  OKLCH is a perceptually uniform colour space (Lightness,
//  Chroma, Hue). Mapping fractal data through it gives smoother,
//  more "natural" palettes than HSV/RGB. The math here is the
//  standard OKLab → linear sRGB → sRGB-gamma transform.
// ============================================================
vec3 oklchToRgb(vec3 oklch) {
    float L = oklch.x; // Lightness  ∈ [0,1]
    float C = oklch.y; // Chroma
    float H = oklch.z; // Hue (radians)

    // OKLab a/b axes from polar (C, H)
    float a = C * cos(H);
    float b = C * sin(H);

    // OKLab → LMS (long/medium/short cone responses)
    float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    float s_ = L - 0.0894841775 * a - 1.291485548 * b;

    // Non-linearity: cube the LMS values
    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    // LMS → linear sRGB
    vec3 linearRgb;
    linearRgb.r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    linearRgb.g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    linearRgb.b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    // Linear sRGB → gamma-encoded sRGB (piecewise sRGB transfer function)
    vec3 lowPart = linearRgb * 12.92;
    vec3 highPart = 1.055 * pow(max(linearRgb, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    vec3 rgb = mix(highPart, lowPart, lessThanEqual(linearRgb, vec3(0.0031308)));

    return clamp(rgb, 0.0, 1.0);
}

// ============================================================
//  Screen UV → complex-plane coordinate c
// ------------------------------------------------------------
//  The Mandelbrot set fits inside |c| < 2, so we map the UV
//  square [0,1]² onto the rectangle [-2, +1] × [-1.5, +1.5]
//  and then shift left by 0.5 so the set's "main body" sits
//  at c.x ≈ -0.5. Zoom and pan are applied in UV space first
//  so they behave intuitively when the user interacts.
// ============================================================
vec2 screenToComplex(vec2 uv) {
    vec2 centered = (uv - 0.5) / u_camera.z + 0.5 + u_panOffset;
    centered.x = (centered.x - 0.5) * u_aspect + 0.5;
    return (centered - 0.5) * 3.0 - vec2(0.5, 0.0);
}

// ============================================================
//  One Mandelbrot iteration step:  z ← z² + c
// ------------------------------------------------------------
//  (x + yi)² = (x² − y²) + 2xy i,  then add c.
// ============================================================
vec2 iterateMandelbrot(vec2 z, vec2 c) {
    return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
}

// ============================================================
//  Continuous height for EXTERIOR points (those that escaped)
// ------------------------------------------------------------
//  Naive integer iteration counts produce ugly banding. The
//  "smooth iteration" formula interpolates between integer
//  steps using the final magnitude of z, removing the bands:
//
//      smooth_n = n + 1 − log2( log(|z|) / log(2) )
//
//  Returns:
//    x = smooth iteration count  (used as "height")
//    y = |z| at escape           (used to drive chroma)
// ============================================================
vec2 computeExteriorData(int iterationCount, vec2 z, float mod2) {
    float logMagnitude = 0.5 * log(mod2); // = log(|z|)
    float nu = log(logMagnitude / LN_2) / LN_2;
    float smoothIter = float(iterationCount) + 1.0 - nu;
    return vec2(smoothIter, length(z));
}

// ============================================================
//  Continuous height for INTERIOR points (those that didn't escape)
// ------------------------------------------------------------
//  Inside the set every orbit is bounded, so iteration count is
//  useless. Instead we look at how close the orbit ever got to
//  the origin (its minimum |z|). A "deeper" interior point has
//  an orbit that settles closer to 0, so it gets a larger height.
//
//  The −log + scale converts the tiny [0, ~1] range of "closest
//  approach" into a usable gradient rather than a flat field.
//
//  Returns:
//    x = convergence height
//    y = closest approach to 0 (used to drive chroma)
// ============================================================
vec2 computeInteriorData(float minMod2) {
    float closest = sqrt(minMod2);
    // +1e-12 guards against log(0) for the exact centre point
    float conv = -log(closest + 1e-12) * INTERIOR_INTENSITY * u_interiorScale;
    return vec2(conv, closest);
}

// ============================================================
//  Evaluate the Mandelbrot field for a single pixel
// ------------------------------------------------------------
//  Runs the escape-time loop, tracks the closest approach to 0
//  (for interior colouring), then dispatches to the exterior or
//  interior height formula based on whether |z| escaped.
// ============================================================
vec2 getMandelbrotData(vec2 uv, int maxIter) {
    vec2 c = screenToComplex(uv);
    vec2 z = vec2(0.0);

    float minMod2 = 1e20; // smallest |z|² seen during the orbit
    float mod2 = 0.0; // current |z|²
    bool escaped = false;
    int escapeIter = 0;

    for (int i = 0; i < maxIter; i++) {
        z = iterateMandelbrot(z, c);

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
// ------------------------------------------------------------
//  Higher zoom ⇒ finer detail ⇒ we need more iterations to
//  separate genuinely interior points from slow escapers.
//  We grow the budget logarithmically with zoom and clamp it
//  to a hard cap for performance.
//
//  Note: log2(z) * (1 / ln 2) collapses to ln(z); we use it
//  purely as a growth rate controlled by u_iterationScale.
// ============================================================
int computeMaxIterations() {
    float logZoom = log2(max(1.0, u_camera.z));
    int iterations = int(u_iterationBase + logZoom * INV_LN_2 * u_iterationScale);
    return min(iterations, int(u_iterationCap));
}

// ============================================================
//  Estimate the surface normal via finite differences
// ------------------------------------------------------------
//  We treat the Mandelbrot height field as a height map and
//  sample it at three nearby points: the pixel itself and two
//  neighbours offset by ε in x and y. The two tangent vectors
//  (Δx, Δh_x) and (Δy, Δh_y) define a local plane whose normal
//  we return.
//
//  IMPORTANT: the height differences are divided by zoom so the
//  *world-space* slope stays roughly constant as we zoom in.
//  Without this compensation the surface would appear to flatten
//  out at high zoom because the UV-space ε shrinks in world space.
//
//  `h0` is passed in (rather than recomputed) so we evaluate the
//  fractal exactly 3 times per pixel, not 4.
// ============================================================
vec3 computeNormal(vec2 uv, int maxIter, float eps, float h0) {
    float hX = getMandelbrotData(uv + vec2(eps / max(u_aspect, 1e-6), 0.0), maxIter).x;
    float hY = getMandelbrotData(uv + vec2(0.0, eps), maxIter).x;

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
//  Lambertian + ambient lighting
// ------------------------------------------------------------
//  light = ambient + diffuse * (1 − ambient)
//  The mix form guarantees the result stays inside [ambient, 1],
//  so ambient acts as the floor and full sun is the ceiling.
// ============================================================
float computeLightIntensity(vec3 normal) {
    vec3 lightDir = normalize(vec3(cos(u_sunAngle), sin(u_sunAngle), 1.0));
    float diffuse = max(0.0, dot(normal, lightDir));
    return clamp(u_ambient + diffuse * (1.0 - u_ambient), 0.0, 1.0);
}

// ============================================================
//  OKLCH colour mapping
// ------------------------------------------------------------
//  Lightness  ← normalised fractal height, modulated by light
//  Chroma     ← different formulas for interior vs exterior
//  Hue        ← height × frequency + shift, wrapped to [0, 2π)
//
//  Interior vs exterior chroma:
//    • Interior points have |z| that stayed small (< 2), so we
//      drive chroma directly from the convergence height. This
//      gives saturated colours that still respond to u_chromaScale.
//    • Exterior points have |z| that grew large at escape, so we
//      use log(|z|) to keep distant escapers from saturating.
// ============================================================
vec3 computeColor(vec2 mandelbrotData, int maxIter, float lightIntensity) {
    float height = mandelbrotData.x;
    float magnitude = mandelbrotData.y;

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

    // 1. Evaluate the fractal field for this pixel
    vec2 mandelbrotData = getMandelbrotData(vUv, maxIter);

    // 2. Build a normal from neighbouring samples and light it
    vec3 normal = computeNormal(vUv, maxIter, eps, mandelbrotData.x);
    float lightIntensity = computeLightIntensity(normal);

    // 3. Map fractal + lighting to an OKLCH colour
    vec3 color = computeColor(mandelbrotData, maxIter, lightIntensity);

    fragColor = vec4(color, 1.0);
}
