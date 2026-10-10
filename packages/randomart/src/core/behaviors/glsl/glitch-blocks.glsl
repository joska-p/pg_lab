vec2 glitchBlocks(vec2 coords, float t, float speed) {
  float band = floor(coords.y * 12.0);
  float step_t = floor(t * speed * 4.0);
  float trigger = step(0.85, fract(sin(band * 12.9898 + step_t) * 43758.5453));
  float seed = fract(sin(band * 78.233 + step_t) * 43758.5453);
  float shift = (seed - 0.5) * 0.25 * trigger;
  coords.x += shift;
  return coords;
}
