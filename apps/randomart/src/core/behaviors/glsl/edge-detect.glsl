vec3 applyLaplacianEdges(vec3 baseColor, vec2 uv, float time) {
    float centerLuminance = dot(baseColor, vec3(0.299, 0.587, 0.114));

    float dX = dFdx(centerLuminance);
    float dY = dFdy(centerLuminance);
    float edge = length(vec2(dX, dY));

    float intensityModifier = 1.0 + smoothNoise(time * 0.3) * 1.0;
    edge *= intensityModifier;

    vec3 edgeColor = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0.0, 2.0, 4.0));
    edgeColor *= 1.5;

    return mix(baseColor, edgeColor, smoothstep(0.04, 0.2, edge));
}
