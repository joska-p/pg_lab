import { defineOperator } from './types.ts';

export const transforms = {
    warp: defineOperator({
        label: 'Warp',
        group: 'transform',
        inputs: ['dx', 'dy'],
        inner: ['f'],
        requires: ['ra_fold2'],
        coords: ({ p, args: { dx, dy } }) => `ra_fold2(${p}+0.5*vec2(${dx},${dy}))`,
        glsl: ({ args: { f } }) => f,
    }),
};
