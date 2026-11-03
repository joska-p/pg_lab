vec3 ra_srgb(vec3 raw) {
    return clamp(raw * 0.5 + 0.5, 0.0, 1.0);
}
