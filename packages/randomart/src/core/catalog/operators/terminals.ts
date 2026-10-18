import { formatGlslFloat } from '../format.ts';
import { defineOperator } from './types.ts';

export const terminals = {
    x: defineOperator({
        label: 'X',
        group: 'terminal',
        glsl: ({ p }) => `${p}.x`,
    }),
    y: defineOperator({
        label: 'Y',
        group: 'terminal',
        glsl: ({ p }) => `${p}.y`,
    }),
    const: defineOperator({
        label: 'Constant',
        group: 'terminal',
        params: { value: { min: -1, max: 1 } },
        glsl: ({ params }) => formatGlslFloat(params.value),
    }),
};
