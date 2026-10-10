vec2 kaleidoscope(vec2 coords, float t, float speed) {
  float rot = t * speed * 0.1;
  float c = cos(rot);
  float s = sin(rot);
  coords = vec2(c * coords.x - s * coords.y, s * coords.x + c * coords.y);

  float r = length(coords);
  float a = atan(coords.y, coords.x);

  float slice = 3.14159265 / 6.0;
  a = mod(a + slice, 2.0 * slice) - slice;
  a = abs(a);

  return r * vec2(cos(a), sin(a));
}
