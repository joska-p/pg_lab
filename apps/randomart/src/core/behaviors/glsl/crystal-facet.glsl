vec2 crystalHash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

vec2 crystalFacet(vec2 x, float t, float speed) {
  vec2 scaled = x * 3.0;
  vec2 n = floor(scaled);
  vec2 f = fract(scaled);
  float minDist = 8.0;
  vec2 cellOffset = vec2(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 h = crystalHash(n + g);
      vec2 cellCenter = g + h;
      float d = length(cellCenter - f);
      if (d < minDist) {
        minDist = d;
        cellOffset = h;
      }
    }
  }
  float facetAngle = t * speed * 0.2 + cellOffset.x * 6.2831;
  mat2 rot = mat2(cos(facetAngle), -sin(facetAngle), sin(facetAngle), cos(facetAngle));
  return rot * x;
}
