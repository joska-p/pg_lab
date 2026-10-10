vec3 spectralPalette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(2.0, 1.0, 0.0);
  vec3 d = vec3(0.5, 0.20, 0.25);
  return a + b * cos(6.28318 * (c * t + d));
}
