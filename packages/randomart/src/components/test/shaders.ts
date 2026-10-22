/** Test shader verifying GPU pipeline + coordinate conventions (gradient + phase animation). */
export const HANDWRITTEN_TEST_SHADER = /* glsl */ `
precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform float u_phase;

const float TWO_PI = 6.283185307179586;

void main() {
    vec2 v_p = vUv * 2.0 - 1.0;

    float r = v_p.x * 0.5 + 0.5;
    float g = v_p.y * 0.5 + 0.5;
    float b = 0.5 + 0.5 * sin(u_phase * TWO_PI);

    o_color = vec4(r, g, b, 1.0);
}
`.trim();
