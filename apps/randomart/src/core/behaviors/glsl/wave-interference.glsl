vec2 waveInterference(vec2 coords, float t, float speed) {
  vec2 p1 = vec2(0.5, 0.3);
  vec2 p2 = vec2(-0.4, -0.5);
  vec2 p3 = vec2(-0.3, 0.6);
  float d1 = length(coords - p1);
  float d2 = length(coords - p2);
  float d3 = length(coords - p3);
  float wave = sin(d1 * 10.0 - t * speed)
             + sin(d2 * 10.0 - t * speed * 1.3)
             + sin(d3 * 10.0 - t * speed * 0.8);
  vec2 dir = normalize(coords + 0.0001);
  return coords + dir * wave * 0.03;
}
