uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    // Basic lighting using the normals
    float lighting = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;

    // Let's mix the base color with a gradient based on UV coordinates
    vec3 finalColor = mix(uColor, vec3(0.8, 0.1, 0.2), vUv.y);

    gl_FragColor = vec4(finalColor * lighting, 1.0);
}
