vec2 domainWarp(vec2 coords, float t, float speed) {
  vec2 q = vec2(
    sin(coords.y * 1.7 + t * speed * 0.6) * 0.5 + sin(coords.x * 2.3 + 1.2) * 0.3,
    cos(coords.x * 1.3 + t * speed * 0.4) * 0.5 + cos(coords.y * 1.9 + 0.7) * 0.3
  );
  return coords + q * 0.4;
}
