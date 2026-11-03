vec3 ra_hslToSrgb(vec3 hsl) {
    float h = hsl.x / 360.0;
    float s = hsl.y / 100.0;
    float l = hsl.z / 100.0;
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}
vec3 ra_hsl(vec3 raw) {
    float h = (raw.x * 0.5 + 0.5) * 360.0;
    float s = abs(raw.y) * 100.0;
    float l = clamp(raw.z * 0.5 + 0.5, 0.0, 1.0) * 100.0;
    return ra_hslToSrgb(vec3(h, s, l));
}
