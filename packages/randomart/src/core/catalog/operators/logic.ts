// No boolean type. By convention true = +1 and false = -1. `select` tests `c > 0`; at exactly 0 it
// takes the else branch. `gt` and `select` create hard edges, which flip abruptly when animated.
import { defineOperator } from './types';

export const logic = {
    gt: defineOperator({
        label: 'Greater than',
        group: 'logic',
        inputs: ['a', 'b'],
        glsl: ({ args: { a, b } }) => `(${a}>${b} ? 1.0 : -1.0)`,
    }),
    select: defineOperator({
        label: 'Select',
        group: 'logic',
        inputs: ['c', 'a', 'b'],
        glsl: ({ args: { c, a, b } }) => `(${c}>0.0 ? ${a} : ${b})`,
    }),
};
