float posterize(float value, float steps) {
    return floor(value * steps) / steps;
}
