vec2 repeatSpace(vec2 uv, float count) {
    return fract(uv * count) - 0.5;
}
