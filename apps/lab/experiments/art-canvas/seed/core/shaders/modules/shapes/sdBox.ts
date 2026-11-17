import code from '../../glsl/shapes/sdBox.glsl?raw';
import type { ShaderModule } from '../../types';

export const sdBox: ShaderModule = {
    name: 'sdBox',
    category: 'shapes',
    weight: 0.8,
    code,
    params: {
        width: { type: 'range', min: 0.15, max: 0.4 },
        height: { type: 'range', min: 0.15, max: 0.4 },
    },
    getCall: ({ uv = 'uv', width = '0.2', height = '0.2' }) =>
        `float dist = sdBox(${uv}, vec2(${width}, ${height}));`,
};
