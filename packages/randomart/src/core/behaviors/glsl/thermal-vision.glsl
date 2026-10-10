vec3 thermalPalette(float t) {
  vec3 c1 = vec3(0.0, 0.0, 0.2);
  vec3 c2 = vec3(0.8, 0.0, 0.6);
  vec3 c3 = vec3(1.0, 0.6, 0.0);
  vec3 c4 = vec3(1.0, 1.0, 0.8);
  if (t < 0.33) return mix(c1, c2, t / 0.33);
  else if (t < 0.66) return mix(c2, c3, (t - 0.33) / 0.33);
  else return mix(c3, c4, (t - 0.66) / 0.34);
}

vec3 thermalVision(vec3 color, float t, float speed) {
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  float shift = fract(lum + t * speed * 0.05);
  return mix(color, thermalPalette(shift), 0.7);
}
