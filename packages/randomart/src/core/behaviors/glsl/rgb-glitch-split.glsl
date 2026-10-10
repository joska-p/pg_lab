vec3 rgbGlitchSplit(vec3 color, vec2 coords, float t, float speed) {
  float band = floor(coords.y * 20.0);
  float step_t = floor(t * speed * 3.0);
  float trigger = step(0.9, fract(sin(band * 91.345 + step_t) * 43758.5453));
  float rShift = trigger * (fract(sin(band * 12.9898 + step_t) * 43758.5453) - 0.5) * 0.4;
  color.r += rShift;
  color.b -= rShift;
  return color;
}
