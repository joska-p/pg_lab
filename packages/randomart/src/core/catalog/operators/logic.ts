import { defineOperator } from './types.ts';

export const logic = {
    gt: defineOperator({
        label: 'Greater than',
        group: 'logic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `(${a}>${b} ? 1.0 : -1.0)`,
        math: ({ args: { a, b } }) => `${a} > ${b}`,
    }),
    select: defineOperator({
        label: 'Select',
        group: 'logic',
        inputs: ['c', 'a', 'b'],
        glsl: ({ args: { c, a, b } }) => `(${c}>0.0 ? ${a} : ${b})`,
        math: ({ args: { c, a, b } }) => `${c} > 0 ? ${a} : ${b}`,
    }),
};
