vec3 branchlessThermal(float t) {
  vec3 c1 = vec3(0.0, 0.0, 0.15);
  vec3 c2 = vec3(0.7, 0.0, 0.55);
  vec3 c3 = vec3(1.0, 0.5, 0.0);
  vec3 c4 = vec3(0.98, 0.98, 0.8);

  float ramp1 = smoothstep(0.0, 0.33, t);
  float ramp2 = smoothstep(0.33, 0.66, t);
  float ramp3 = smoothstep(0.66, 1.0, t);

  vec3 col = mix(c1, c2, ramp1);
  col = mix(col, c3, ramp2);
  col = mix(col, c4, ramp3);
  return col;
}
