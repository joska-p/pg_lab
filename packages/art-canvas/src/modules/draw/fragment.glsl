float sdCircle(vec2 p, float r)
{
    return length(p) - r;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    // ----------------------------------------------------------
    // Constantes
    // ----------------------------------------------------------
    const float RADIUS = 0.32;
    const float AMBIENT = 0.16;
    const float SPECULAR_POWER = 28.0;
    const float SPECULAR_STRENGTH = 0.5;

    // Déformation
    const float DEFORM_AMOUNT = 0.09; // force
    const float DEFORM_FREQ = 5.5; // fréquence (plus bas = plus large)

    // ----------------------------------------------------------
    // Déformation du domaine (beaucoup plus propre)
    // ----------------------------------------------------------
    vec2 p = uv;

    // Déformation en vague
    p.x += sin(p.y * DEFORM_FREQ + iTime * 0.8) * DEFORM_AMOUNT;
    p.y += sin(p.x * DEFORM_FREQ + iTime * 0.8) * DEFORM_AMOUNT;

    // ----------------------------------------------------------
    // Sphère
    // ----------------------------------------------------------
    float d = sdCircle(p, RADIUS);
    vec3 color = vec3(0.015);

    if (d < 0.0)
    {
        float z = sqrt(max(RADIUS * RADIUS - dot(p, p), 0.0));

        z += sin(DEFORM_FREQ + iTime * 0.8) * DEFORM_AMOUNT;

        vec3 surfacePosition = vec3(p, z);
        vec3 surfaceNormal = normalize(surfacePosition);

        vec3 lightDirection = normalize(vec3(0.65, 0.5, 0.7));
        vec3 viewDirection = vec3(0.0, 0.0, 1.0);

        // Éclairage
        float diffuse = max(dot(surfaceNormal, lightDirection), 0.0);
        vec3 reflectDir = reflect(-lightDirection, surfaceNormal);
        float specular = pow(max(dot(viewDirection, reflectDir), 0.0), SPECULAR_POWER);

        vec3 baseColor = vec3(0.22, 0.52, 1.0);
        color = baseColor * (AMBIENT + (1.0 - AMBIENT) * diffuse);
        color += vec3(1.0) * specular * SPECULAR_STRENGTH;
    }

    fragColor = vec4(color, 1.0);
}
