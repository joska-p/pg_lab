vec2 voronoiHash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
}

float voronoi(vec2 x, float time, float animSpeed) {
    vec2 n = floor(x);
    vec2 f = fract(x);

    float minDist = 8.0;

    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = voronoiHash(n + g);

            o = 0.5 + 0.4 * sin(time * animSpeed + o * 6.2831);

            vec2 r = g + o - f;
            float d = dot(r, r);

            if (d < minDist) {
                minDist = d;
            }
        }
    }
    return sqrt(minDist);
}
