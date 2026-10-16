import { defineOperator } from './types.ts';

export const arithmetic = {
    neg: defineOperator({
        label: 'Negate',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `-${a}`,
        math: ({ args: { a } }) => `−${a}`,
    }),
    abs: defineOperator({
        label: 'Absolute',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `abs(${a})`,
        math: ({ args: { a } }) => `|${a}|`,
    }),
    sqr: defineOperator({
        label: 'Square',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args: { a } }) => `${a}*${a}`,
        math: ({ args: { a } }) => `${a}²`,
    }),
    add: defineOperator({
        label: 'Average',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `(${a}+${b})*0.5`,
        math: ({ args: { a, b } }) => `(${a} + ${b}) / 2`,
    }),
    mul: defineOperator({
        label: 'Multiply',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `${a}*${b}`,
        math: ({ args: { a, b } }) => `${a} × ${b}`,
    }),
    div: defineOperator({
        label: 'Divide',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `${a}/(1.0+abs(${b}))`,
        math: ({ args: { a, b } }) => `${a} / (1 + |${b}|)`,
    }),
    min: defineOperator({
        label: 'Min',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `min(${a},${b})`,
        math: ({ args: { a, b } }) => `min(${a}, ${b})`,
    }),
    max: defineOperator({
        label: 'Max',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `max(${a},${b})`,
        math: ({ args: { a, b } }) => `max(${a}, ${b})`,
    }),
    mix: defineOperator({
        label: 'Mix',
        group: 'arithmetic',
        inputs: ['a', 'b', 't'],
        glsl: ({ args: { a, b, t } }) => `mix(${a},${b},(${t}+1.0)*0.5)`,
        math: ({ args: { a, b, t } }) => `mix(${a}, ${b}, ${t})`,
    }),
};
