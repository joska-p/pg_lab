export const GRAIN_FRAGMENT_SHADER = /* glsl */ `
#version 300 es
precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform sampler2D u_source;
uniform vec2 u_resolution;

// Deterministic high-quality hash based on screen pixel coords
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
    vec4 src = texture(u_source, vUv);
    vec2 pixel = vUv * u_resolution;
    float noise = (hash(pixel) - 0.5) * 0.10;
    o_color = vec4(clamp(src.rgb + noise, 0.0, 1.0), src.a);
}
`.trim();
