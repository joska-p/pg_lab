import { defineOperator } from './types.ts';

export const trigonometry = {
    sin: defineOperator({
        label: 'Sine',
        group: 'trigonometry',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `sin(PI*${a})`,
        math: ({ args: { a } }) => `sin(π·${a})`,
    }),
    cos: defineOperator({
        label: 'Cosine',
        group: 'trigonometry',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `cos(PI*${a})`,
        math: ({ args: { a } }) => `cos(π·${a})`,
    }),
};
