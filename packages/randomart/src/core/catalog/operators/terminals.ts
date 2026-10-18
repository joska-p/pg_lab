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
    tsin: defineOperator({
        label: 'Time sine',
        group: 'terminal',
        requires: ['u_phase'],
        glsl: () => 'sin(2.0*PI*u_phase)',
    }),
    // `tsin` and `tcos` are exactly periodic in `u_phase`, so any loop duration loops cleanly.
    tcos: defineOperator({
        label: 'Time cosine',
        group: 'terminal',
        requires: ['u_phase'],
        glsl: () => 'cos(2.0*PI*u_phase)',
    }),
};
