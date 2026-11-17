vec2 kaleidoscope(vec2 uv, float segments) {
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float seg = 6.28318 / segments;
    angle = mod(angle, seg) - seg * 0.5;
    return vec2(cos(angle), sin(angle)) * radius;
}
