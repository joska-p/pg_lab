vec4 permute(vec4 x) {
    return mod((x * 34.0 + 1.0) * x, 289.0);
}

float noise2d(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0);
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;

    vec4 i = permute(permute(ix) + iy);

    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x, gy.x);
    vec2 g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z);
    vec2 g11 = vec2(gx.w, gy.w);
    vec4 norm =
        1.79284291400159 -
        0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    vec2 m = max(0.5 - vec2(dot(fx.xz, fx.xz), dot(fx.yw, fx.yw)), 0.0);

    m = m * m;
    return 49.0 * dot(m * m, vec2(dot(g00, fx.xz), dot(g11, fx.yw))) +
    49.0 * dot(m * m, vec2(dot(g01, fx.xw), dot(g10, fx.yz)));
}
