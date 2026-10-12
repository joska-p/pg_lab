import { toGLSL } from '../../core';
import type { Node } from '../../core';

// Mirrors the Glaze fullscreen contract used by `compileToGLSL`: the surface
// vertex shader emits `vUv` and the surface clock drives `u_clockTime`. Operators
// (`osc`, `shift`) also read that clock, so the value shader must declare it.
export function buildValueFragmentShader(node: Node): string {
    const expression = toGLSL(node);

    return `#version 300 es
precision highp float;

uniform float u_clockTime;

in vec2 vUv;

out vec4 fragColor;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float value = ${expression};
  float gray = clamp(value, -1.0, 1.0) * 0.5 + 0.5;
  fragColor = vec4(gray, gray, gray, 1.0);
}
`;
}
