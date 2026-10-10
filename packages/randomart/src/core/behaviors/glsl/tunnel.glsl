vec2 tunnel(vec2 coords, float t, float speed) {
  float r = length(coords) + 0.0001;
  float a = atan(coords.y, coords.x);
  float depth = fract(log(r) * 0.5 - t * speed * 0.2);
  return vec2(a / 3.14159265, depth * 2.0 - 1.0);
}
