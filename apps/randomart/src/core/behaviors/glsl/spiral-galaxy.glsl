vec2 spiralGalaxy(vec2 coords, float t, float speed) {
  float r = length(coords);
  float a = atan(coords.y, coords.x);
  float spiralAmount = 3.0 * log(r + 0.001) + t * speed * 0.3;
  a += spiralAmount * 0.5;
  return vec2(cos(a), sin(a)) * r;
}
