vec2 swirl(vec2 coords, float angle) {
  float r = length(coords);
  float a = atan(coords.y, coords.x) + angle * (1.0 - r);
  return vec2(cos(a) * r, sin(a) * r);
}
