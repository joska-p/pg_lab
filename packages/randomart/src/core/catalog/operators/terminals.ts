import { formatGlslFloat } from '../format.ts';
import { defineOperator } from './types.ts';

export const terminals = {
    x: defineOperator({
        label: 'X',
        group: 'terminal',
        glsl: ({ p }) => `${p}.x`,
        math: () => 'x',
    }),
    y: defineOperator({
        label: 'Y',
        group: 'terminal',
        glsl: ({ p }) => `${p}.y`,
        math: () => 'y',
    }),
    const: defineOperator({
        label: 'Constant',
        group: 'terminal',
        params: { value: { min: -1, max: 1 } },
        glsl: ({ params }) => formatGlslFloat(params.value),
        math: ({ params }) => String(params.value),
    }),
    tsin: defineOperator({
        label: 'Time sine',
        group: 'terminal',
        requires: ['u_phase'],
        glsl: () => 'sin(2.0*PI*u_phase)',
        math: () => 'sin(2π·t)',
    }),
    tcos: defineOperator({
        label: 'Time cosine',
        group: 'terminal',
        requires: ['u_phase'],
        glsl: () => 'cos(2.0*PI*u_phase)',
        math: () => 'cos(2π·t)',
    }),
};
