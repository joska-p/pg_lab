vec3 applyIridescence(vec3 baseColor, vec2 coords, float t) {
  float factor = sin(coords.x * 2.5 + t) * cos(coords.y * 2.5 - t);
  vec3 sheen = 0.5 + 0.5 * cos(t + coords.xyx * 3.0 + vec3(0.0, 2.0, 4.0));
  return mix(baseColor, baseColor + sheen * 0.4, smoothstep(-0.5, 0.5, factor));
}
