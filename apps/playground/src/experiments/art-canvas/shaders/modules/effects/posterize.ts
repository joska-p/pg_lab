import code from '../../glsl/effects/posterize.glsl?raw';
import type { ShaderModule } from '../../types';

export const posterize: ShaderModule = {
    name: 'posterize',
    category: 'effects',
    weight: 1.0,
    code,
    params: {
        val: { type: 'literal', value: 'wave' },
        steps: { type: 'range', min: 3.0, max: 12.0, precision: 1 },
    },
    getCall: ({ val = '0.0', steps = '1.0' }) => `wave = posterize(${val}, ${steps});`,
};
