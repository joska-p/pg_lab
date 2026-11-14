import code from '../../glsl/space/flowField.glsl?raw';
import type { ShaderModule } from '../../types';

export const flowField: ShaderModule = {
    name: 'flowField',
    category: 'space',
    weight: 1.5,
    code,
    deps: ['noise2d'],
    params: {
        time: { type: 'global', value: 'iTime' },
        strength: { type: 'range', min: 0.05, max: 0.2 },
    },
    getCall: ({ uv = 'uv', time = 'iTime', strength = '0.1' }) =>
        `${uv} = flowField(${uv}, ${time}, ${strength});`,
};
