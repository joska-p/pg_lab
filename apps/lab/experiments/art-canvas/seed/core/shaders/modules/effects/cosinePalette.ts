import code from '../../glsl/effects/cosinePalette.glsl?raw';
import type { ShaderModule } from '../../types';

export const cosinePalette: ShaderModule = {
    name: 'cosinePalette',
    category: 'effects',
    code,
    getCall: ({ dist = '0.0', offset = '0.0', a = '1.0', b = '1.0', c = '1.0', d = '0.0' }) =>
        `vec3 col = cosinePalette(${dist} + ${offset}, ${a}, ${b}, ${c}, ${d});`,
};
