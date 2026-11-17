vec2 polarCoords(vec2 uv) {
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    return vec2(r, a);
}
