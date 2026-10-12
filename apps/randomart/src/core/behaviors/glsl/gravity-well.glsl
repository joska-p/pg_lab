vec2 gravityWell(vec2 coords, float t, float speed) {
  vec2 p1 = 0.5 * vec2(cos(t * speed * 0.4), sin(t * speed * 0.4));
  vec2 p2 = 0.5 * vec2(cos(t * speed * 0.3 + 3.1415), sin(t * speed * 0.5));

  float d1 = length(coords - p1);
  float d2 = length(coords - p2);

  vec2 pull1 = (p1 - coords) * (0.08 / (d1 * d1 + 0.04));
  vec2 pull2 = (p2 - coords) * (0.08 / (d2 * d2 + 0.04));

  return coords + pull1 + pull2;
}
