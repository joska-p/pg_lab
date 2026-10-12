vec2 cosmicMaelstrom(vec2 coords, float t, float speed) {
  float r = length(coords);
  float theta = atan(coords.y, coords.x);
  float logR = log(max(r, 0.04));
  float twist = 4.0 * logR + sin(r * 8.0 - t * speed) * 0.5;
  theta += twist * 0.4;
  float pulse = 1.0 + 0.15 * sin(t * speed * 0.8 - r * 3.0);
  return vec2(cos(theta), sin(theta)) * (r * pulse);
}
