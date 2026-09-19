float sdTruchet(vec2 uv, float scale) {
    vec2 p = uv * scale;
    vec2 id = floor(p);
    vec2 f = fract(p) - 0.5;
    float rnd = fract(sin(dot(id, vec2(127.1, 311.7))) * 43758.5453);
    if (rnd < 0.5) {
        return min(length(f + 0.5), length(f - 0.5)) - 0.4;
    } else {
        return min(length(f - vec2(-0.5, 0.5)), length(f - vec2(0.5, -0.5))) - 0.4;
    }
}
