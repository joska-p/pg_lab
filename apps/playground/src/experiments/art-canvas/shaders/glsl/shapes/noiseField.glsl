// Organic distance field from layered noise
// Requires noise2d and fbm from preamble
float noiseField(vec2 uv, float scale, float time, float speed) {
    vec2 p = uv * scale + vec2(time * speed * 0.3);
    float n = fbm(p, 4);
    p += vec2(n * 0.3, n * 0.2);
    n = fbm(p, 3);
    return n - 0.5;
}
