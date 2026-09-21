import type { ShaderModule } from '../../types';

export const mouseAttractor: ShaderModule = {
    name: 'mouseAttractor',
    category: 'space',
    weight: 3.0,
    code: `
    vec2 mouseAttractor(vec2 uv, vec2 mouse, float strength) {
        vec2 m = mouse * 2.0 - 1.0;
        vec2 dir = m - uv;
        float dist = length(dir);
        return uv + normalize(dir) * (1.0 / (dist + 1.0)) * strength;
    }
  `,
    params: {
        mouse: { type: 'global', value: 'u_mouse' },
        strength: { type: 'range', min: 0.02, max: 0.12 },
    },
    getCall: ({ uv = 'uv', mouse = 'u_mouse', strength = '0.1' }) =>
        `uv = mouseAttractor(${uv}, ${mouse}, ${strength});`,
};
