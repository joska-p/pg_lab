vec3 neonGlow(vec3 color, float t, float speed) {
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  float pulse = 0.5 + 0.5 * sin(t * speed * 0.6);
  float glow = smoothstep(0.5, 0.9, lum) * pulse;
  return color + glow * vec3(0.3, 0.8, 1.0);
}
