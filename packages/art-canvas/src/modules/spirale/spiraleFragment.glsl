#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_clockTime;
uniform float u_gap;

const float TWO_PI = 6.283185307179586;

// --- GLSL 3D PERLIN NOISE ---
vec4 permute(vec4 x) {
    return mod((x * 34.0 + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(
        permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
            i.x +
            vec4(0.0, i1.x, i2.x, 1.0)
    );
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    // 1. Baseline distance for noise scaling
    float rawR = length(uv);

    // 2. Static Noise Vector Field (frozen noise layout for consistent print geography)
    float noiseScale = 3.5;
    float nX = snoise(vec3(uv * noiseScale, 0.0));
    float nY = snoise(vec3(uv * noiseScale + vec2(10.0), 0.0));

    float distortionStrength = 0.15;
    float growthExponent = 1.5;
    float currentStrength = pow(rawR, growthExponent) * distortionStrength;

    // 3. Distort the coordinates
    vec2 distortedUv = uv + vec2(nX, nY) * currentStrength;

    // --- ARCHIMEDEAN SPIRAL MATH ---
    float r = length(distortedUv);
    float theta = atan(distortedUv.y, distortedUv.x);

    if (theta < 0.0) {
        theta += TWO_PI;
    }

    float b = u_gap / TWO_PI;
    float lineWidth = 0.004;

    float ringIndex = floor((r - b * theta) / u_gap);
    float spiralR = b * (theta + ringIndex * TWO_PI);

    if (r < spiralR) {
        ringIndex -= 1.0;
        spiralR = b * (theta + ringIndex * TWO_PI);
    }

    float distToLine = abs(r - spiralR);

    // --- SCREEN SPACE ANTI-ALIASING ---
    float delta = fwidth(distToLine);
    float halfWidth = lineWidth * 0.5;
    float mask = 1.0 - smoothstep(halfWidth - delta, halfWidth + delta, distToLine);

    // --- DRAWING PROGRESS ANIMATION ---
    // Calculate total accumulated angle (in radians) for this specific segment of the spiral
    float totalTheta = theta + ringIndex * TWO_PI;

    // Define how fast the pen draws (radians per second)
    float drawSpeed = 12.0;
    float currentMaxTheta = u_clockTime * drawSpeed;

    // Smoothly cut off the line right at the current pen tip location
    float penDelta = fwidth(totalTheta);
    float drawProgressMask =
        1.0 - smoothstep(currentMaxTheta - penDelta, currentMaxTheta + penDelta, totalTheta);

    // Combine line visibility with the drawing progress
    mask *= drawProgressMask;

    // Plotter aesthetic rendering
    vec3 inkColor = vec3(0.97, 0.96, 0.93);
    vec3 paperColor = vec3(0.05, 0.05, 0.1);
    vec3 color = mix(paperColor, inkColor, mask);

    fragColor = vec4(color, 1.0);
}
