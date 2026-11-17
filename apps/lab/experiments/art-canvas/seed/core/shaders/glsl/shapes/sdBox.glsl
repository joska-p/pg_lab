float sdBox(vec2 uv, vec2 size) {
    vec2 d = abs(uv) - size;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
