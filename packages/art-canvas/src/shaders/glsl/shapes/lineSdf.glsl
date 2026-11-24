float sdLine(vec2 uv, vec2 a, vec2 b) {
    vec2 pa = uv - a;
    vec2 ba = b - a;
    float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * t);
}
