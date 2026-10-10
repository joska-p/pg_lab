vec2 gravityLens(vec2 coords, float t, float speed) {
  vec2 center = 0.6 * vec2(cos(t * speed * 0.3), sin(t * speed * 0.37));
  vec2 delta = coords - center;
  float d = length(delta);
  float bend = 0.15 / (d * d + 0.04);
  return coords - normalize(delta + vec2(0.0001)) * bend;
}
