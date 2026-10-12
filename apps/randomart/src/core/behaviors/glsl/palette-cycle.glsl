vec3 iqPalette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.28318 * (c * t + d));
}

vec3 paletteCycleColor(vec3 baseColor, float t) {
  float lum = dot(baseColor, vec3(0.299, 0.587, 0.114));
  return iqPalette(lum + t * 0.15);
}
