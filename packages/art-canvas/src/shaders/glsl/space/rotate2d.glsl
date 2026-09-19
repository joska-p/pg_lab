vec2 rotate2d(vec2 uv, float angle) {
    uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
    return uv;
}
