import { defineOperator } from './defineOperator';

export const transforms = {
    warp: defineOperator({
        label: 'Warp',
        group: 'transform',
        inputs: ['dx', 'dy'],
        inner: ['f'],
        requires: ['ra_fold2'],
        // dx and dy are at most 1 in absolute value, so p + 0.5·(dx, dy) stays in [-1.5, 1.5]²;
        // ra_fold2 folds it back into [-1, 1]².
        coords: ({ p, args: { dx, dy } }) => `ra_fold2(${p}+0.5*vec2(${dx},${dy}))`,
        glsl: ({ args: { f } }) => f,
    }),
};
