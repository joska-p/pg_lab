vec3 auroraFlow(vec3 color, vec2 coords, float t, float speed) {
  float wave1 = sin(coords.x * 3.0 + t * speed * 0.4);
  float wave2 = sin(coords.y * 2.0 - t * speed * 0.3 + wave1);
  vec3 aurora = vec3(
    0.2 + 0.3 * sin(wave2),
    0.5 + 0.4 * cos(wave1 * 1.3),
    0.6 + 0.3 * sin(wave1 + wave2)
  );
  return mix(color, color + aurora * 0.3, 0.5);
}
