import { GLSL_FUNCTIONS, glslFloat } from '@repo/randomart-core/glsl';

/** Radius of the soft luminance clip, in display-referred [0, 1] units. */
const SMOOTH_RADIUS = 0.15;

/** Luminance the clip eases toward: highlights above it for min, shadows below it for max. */
const CLIP_LEVEL = 0.5;

/**
 * Soft luminance clip built on the core smooth min/max helpers, so the rendered effect and the
 * operator registry cannot drift apart. The clipped luminance becomes a gain on the source color:
 * writing it back as `vec3(clipped)` would replace the artwork with a grayscale mask.
 */
function createSoftClipFragmentShader(operator: 'ra_smin' | 'ra_smax'): string {
    return /* glsl */ `
#version 300 es
precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform sampler2D u_source;

${GLSL_FUNCTIONS[operator]}

void main() {
    vec4 src = texture(u_source, vUv);
    float lum = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722));
    float clipped = ${operator}(lum, ${glslFloat(CLIP_LEVEL)}, ${glslFloat(SMOOTH_RADIUS)});
    float gain = clipped / max(lum, 1e-4);
    o_color = vec4(clamp(src.rgb * gain, 0.0, 1.0), src.a);
}
`.trim();
}

export const SMIN_FRAGMENT_SHADER = createSoftClipFragmentShader('ra_smin');
export const SMAX_FRAGMENT_SHADER = createSoftClipFragmentShader('ra_smax');
