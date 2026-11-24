// Shared GLSL chunk: bump lighting + analytic normals.
//
// Previously duplicated 3× (naive had computeLightIntensity as a function
// closing over uniforms; double-split and perturbation inlined the same
// Lambertian math and the same dFdx/dFdy analytic-normal block). The chunk
// versions take explicit parameters so bodies stay free of hidden uniform
// dependencies.

// Lambertian + ambient: light = ambient + diffuse * (1 - ambient), clamped
// to [ambient, 1] so ambient acts as the floor and full sun as the ceiling.
float computeLightIntensity(vec3 normal, float sunAngle, float ambient) {
    vec3 lightDir = normalize(vec3(cos(sunAngle), sin(sunAngle), 1.0));
    float diffuse = max(0.0, dot(normal, lightDir));
    return clamp(ambient + diffuse * (1.0 - ambient), 0.0, 1.0);
}

// Analytic normal via screen-space derivatives (double-split + perturbation).
// Reconstructs dh/duv from dFdx/dFdy of the height field instead of extra
// fractal evaluations. uv is the interpolated screen UV (vUv).
vec3 computeAnalyticNormal(float h0, vec2 uv, float heightScale, float pixelEps) {
    vec2 dU = dFdx(uv);
    vec2 dV = dFdy(uv);
    float det = dU.x * dV.y - dU.y * dV.x;

    float dhdu = 0.0;
    float dhdv = 0.0;
    if (abs(det) > 1e-9) {
        float dhdx = dFdx(h0);
        float dhdy = dFdy(h0);
        dhdu = (dhdx * dV.y - dhdy * dU.y) / det;
        dhdv = (dU.x * dhdy - dV.x * dhdx) / det;
    }

    return normalize(vec3(-dhdu * heightScale, -dhdv * heightScale, pixelEps));
}
