#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;

/** Rayon du cercle (fraction de la hauteur d'écran). */
const float RADIUS = 0.10;

/** Couleur de fond. */
const vec3 BG_COLOR = vec3(0.04, 0.04, 0.06);

/** Couleur du cercle. */
const vec3 INK_COLOR = vec3(0.40, 0.70, 1.00);

void main() {
    // vUv est déjà dans le même espace normalisé [0,1] que u_mouse (Y vers le haut).
    float dist = length(vUv - u_mouse);

    // Bordure anti-aliassée via fwidth (1 fragment de large environ).
    float edge = fwidth(dist);
    float mask = 1.0 - smoothstep(RADIUS - edge, RADIUS + edge, dist);

    fragColor = vec4(mix(BG_COLOR, INK_COLOR, mask), 1.0);
}
