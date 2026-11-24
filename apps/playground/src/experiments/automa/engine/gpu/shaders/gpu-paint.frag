precision highp float;

out vec4 fragColor;

uniform highp sampler2D u_state;
uniform ivec2 u_targetCell;
uniform float u_value;

void main() {
    ivec2 cell = ivec2(gl_FragCoord.xy);
    vec4 current = texelFetch(u_state, cell, 0);

    if (all(equal(cell, u_targetCell))) {
        float normalized = u_value / 255.0;
        fragColor = vec4(normalized, normalized, normalized, 1.0);
    } else {
        fragColor = current;
    }
}
