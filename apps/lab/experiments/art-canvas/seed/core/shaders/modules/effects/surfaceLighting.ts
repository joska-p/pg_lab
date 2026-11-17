import type { ShaderModule } from '../../types';

export const surfaceLighting: ShaderModule = {
    name: 'surfaceLighting',
    category: 'effects',
    weight: 1.0,
    code: `
    vec3 calculateNormal(vec2 uv, float dist) {
        vec2 eps = vec2(0.005, 0.0);
        float dx = dist - length(uv + eps.xy);
        float dy = dist - length(uv + eps.yx);
        return normalize(vec3(dx, dy, 0.03));
    }
  `,
    getCall: ({ uv = 'vec2(0.0)', dist = 'dist' }) =>
        `vec3 normal = calculateNormal(${uv}, ${dist});`,
};
