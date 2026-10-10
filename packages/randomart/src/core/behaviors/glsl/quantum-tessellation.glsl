vec2 quantumGridHash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

vec2 quantumTessellation(vec2 p, float t, float speed) {
  vec2 scaled = p * 4.0;
  vec2 ip = floor(scaled);
  vec2 fp = fract(scaled);

  float minDist = 4.0;
  vec2 targetOffset = vec2(0.0);

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = quantumGridHash(ip + g);
      o = 0.5 + 0.5 * sin(t * speed * 0.5 + o * 6.2831);
      vec2 r = g + o - fp;
      float d = dot(r, r);
      if (d < minDist) {
        minDist = d;
        targetOffset = o;
      }
    }
  }
  float angle = t * speed * 0.15 + (targetOffset.x - targetOffset.y) * 2.0;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  return mix(p, rot * p, smoothstep(0.1, 0.9, minDist));
}
