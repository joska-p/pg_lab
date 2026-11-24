// Fractal Brownian Motion — layered noise octaves
// Requires noise2d from preamble/noise2d.glsl
float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        value += amplitude * noise2d(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
