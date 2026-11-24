float hash2d(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash2d(i);
    float b = hash2d(i + vec2(1.0, 0.0));
    float c = hash2d(i + vec2(0.0, 1.0));
    float d = hash2d(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 domainWarp(vec2 uv, float time, float intensity) {
    vec2 q = vec2(
        valueNoise(uv + vec2(0.0, 0.0) + time * 0.2),
        valueNoise(uv + vec2(5.2, 1.3) + time * 0.2)
    );

    vec2 r = vec2(
        valueNoise(uv + 4.0 * q + vec2(1.7, 9.2) + time * 0.4),
        valueNoise(uv + 4.0 * q + vec2(8.3, 2.8) + time * 0.4)
    );

    return uv + intensity * r;
}
