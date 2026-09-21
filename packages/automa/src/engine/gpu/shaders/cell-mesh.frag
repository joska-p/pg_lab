precision highp float;

uniform sampler2D u_grid;
uniform vec3 u_stateColors[8];
uniform vec3 u_background;
uniform vec3 u_trailColor;
uniform float u_trailStrength;
uniform vec2 u_gridOrigin;
uniform float u_gridScale;
uniform vec2 u_gridSize;
uniform vec2 u_resolution;
uniform float u_dpr;
uniform vec3 u_camera;

in vec2 vUv;
out vec4 fragColor;

void main() {
    // Parity contract with Camera.screenToWorld: the camera lives in DOM-style
    // CSS pixels (Y-down) while vUv is Y-up, so flip once here. From this line
    // on, `world` matches exactly what getCellAtWorld() computes on the CPU.
    vec2 css = vec2(vUv.x, 1.0 - vUv.y) * (u_resolution / u_dpr);
    vec2 world = (css - u_camera.xy) / u_camera.z;

    // Grid placement comes from computeGridRect(), shared with pointer picking.
    ivec2 texelCoord = ivec2(floor((world - u_gridOrigin) / u_gridScale));
    if (
        texelCoord.x < 0 ||
        texelCoord.x >= int(u_gridSize.x) ||
        texelCoord.y < 0 ||
        texelCoord.y >= int(u_gridSize.y)
    ) {
        fragColor = vec4(u_background, 1.0);
        return;
    }

    // Texture row 0 lives at the bottom (GL convention); texelCoord.y counts
    // down from the top edge, mirroring getCellAtWorld().
    int row = int(u_gridSize.y) - 1 - texelCoord.y;
    vec4 state = texelFetch(u_grid, ivec2(texelCoord.x, row), 0);

    int stateId = int(state.r * 255.0 + 0.5);
    float age = state.g;

    vec3 base = u_stateColors[stateId];
    if (stateId == 0 && age > 0.0) {
        base = mix(base, u_trailColor, age * u_trailStrength);
    }

    fragColor = vec4(base, 1.0);
}
