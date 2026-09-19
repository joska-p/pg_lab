vec2 flowField(vec2 uv, float time, float strength) {
    float n1 = noise2d(uv * 2.0 + vec2(time * 0.1));
    float n2 = noise2d(uv * 2.0 + vec2(time * 0.15 + 20.0));
    return uv + vec2(n1, n2) * strength;
}
