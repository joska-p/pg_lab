import { defineOperator } from './types';

export const arithmetic = {
    neg: defineOperator({
        label: 'Negate',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `-${a}`,
    }),
    abs: defineOperator({
        label: 'Absolute',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `abs(${a})`,
    }),
    sqr: defineOperator({
        label: 'Square',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `${a}*${a}`,
    }),
    add: defineOperator({
        label: 'Average',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `(${a}+${b})*0.5`,
    }),
    mul: defineOperator({
        label: 'Multiply',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `${a}*${b}`,
    }),
    div: defineOperator({
        label: 'Divide',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `${a}/(1.0+abs(${b}))`,
    }),
    min: defineOperator({
        label: 'Min',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `min(${a},${b})`,
    }),
    max: defineOperator({
        label: 'Max',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `max(${a},${b})`,
    }),
    mix: defineOperator({
        label: 'Mix',
        group: 'arithmetic',
        inputs: ['a', 'b', 't'],
        glsl: ({ args: { a, b, t } }) => `mix(${a},${b},(${t}+1.0)*0.5)`,
    }),
};
