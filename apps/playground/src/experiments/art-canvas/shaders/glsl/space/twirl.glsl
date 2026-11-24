vec2 twirl(vec2 uv, float strength, vec2 center) {
    vec2 p = uv - center;
    float angle = strength * length(p);
    float s = sin(angle);
    float c = cos(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c) + center;
}
