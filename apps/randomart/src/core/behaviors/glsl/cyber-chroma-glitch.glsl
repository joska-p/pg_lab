vec2 cyberGlitch(vec2 coords, float t, float speed) {
  float row = floor(coords.y * 24.0);
  float timeline = floor(t * speed * 6.0);

  float trigger = step(0.92, fract(sin(row * 41.134 + timeline) * 43758.5453));
  float shift = (fract(sin(row * 92.73 + timeline) * 23412.18) - 0.5) * 0.3 * trigger;

  coords.x += shift;
  return coords;
}
