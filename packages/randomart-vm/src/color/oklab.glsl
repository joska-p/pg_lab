vec3 ra_oklabToSrgb(vec3 lab) {
    float l_ = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
    float m_ = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
    float s_ = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;
    vec3 linear = vec3(
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
    vec3 lo = linear * 12.92;
    vec3 hi = 1.055 * pow(max(linear, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    return clamp(mix(hi, lo, lessThanEqual(linear, vec3(0.0031308))), 0.0, 1.0);
}
vec3 ra_oklab(vec3 raw) {
    float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);
    return ra_oklabToSrgb(vec3(L, raw.y * 0.4, raw.z * 0.4));
}
