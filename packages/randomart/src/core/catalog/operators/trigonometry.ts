import { defineOperator } from './defineOperator';

export const trigonometry = {
    sin: defineOperator({
        label: 'Sine',
        group: 'trigonometry',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `sin(PI*${a})`,
    }),
    cos: defineOperator({
        label: 'Cosine',
        group: 'trigonometry',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `cos(PI*${a})`,
    }),
};
