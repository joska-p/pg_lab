uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Simple wind animation trick: move vertices based on time and position
    vec3 pos = position;
    pos.x += sin(uTime * 2.0 + instanceMatrix[3][1] * 5.0) * 0.05;

    // CRITICAL FOR INSTANCING: Apply the instanceMatrix
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
