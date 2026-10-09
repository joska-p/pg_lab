import { clamp } from '../../util';
import type { Operator } from './registry';

export const sumOp = {
    arity: 2,
    kind: 'combinator',
    label: 'sum',
    argNames: ['a', 'b'],
    evaluate: ({ args }) => clamp(((args.a ?? 0.5) + (args.b ?? 0.5)) / 2),
    toGLSL: ({ args }) => `clamp((${args.a ?? 0.5} + ${args.b ?? 0.5}) * 0.5, -1.0, 1.0)`,
    toMathString: ({ args }) => `(${args.a ?? 0.5} + ${args.b ?? 0.5}) / 2`,
} as const satisfies Operator;

export const productOp = {
    arity: 2,
    kind: 'combinator',
    label: 'product',
    argNames: ['a', 'b'],
    evaluate: ({ args }) => clamp((args.a ?? 0.5) * (args.b ?? 0.5)),
    toGLSL: ({ args }) => `clamp((${args.a ?? 0.5}) * (${args.b ?? 0.5}), -1.0, 1.0)`,
    toMathString: ({ args }) => `(${args.a ?? 0.5} · ${args.b ?? 0.5})`,
} as const satisfies Operator;

export const modOp = {
    arity: 2,
    kind: 'combinator',
    label: 'mod',
    argNames: ['a', 'b'],
    evaluate: ({ args }) => {
        if (Math.abs(args.b ?? 0.5) < 1e-6) {
            return 0;
        }

        return clamp(
            (args.a ?? 0.5) - (args.b ?? 0.5) * Math.floor((args.a ?? 0.5) / (args.b ?? 0.5)),
        );
    },
    toGLSL: ({ args }) =>
        `(abs(${args.b ?? 0.5}) < 1e-6 ? 0.0 : mod(${args.a ?? 0.5}, ${args.b ?? 0.5}))`,
    toMathString: ({ args }) => `(${args.a ?? 0.5} mod ${args.b ?? 0.5})`,
} as const satisfies Operator;

export const powOp = {
    arity: 2,
    kind: 'combinator',
    label: 'pow',
    argNames: ['base', 'exp'],
    evaluate: ({ args }) => {
        const ev = Math.max(-3.0, Math.min(3.0, args.exp ?? 0.5));

        return clamp(Math.sign(args.base ?? 0.5) * Math.abs(args.base ?? 0.5) ** ev);
    },
    toGLSL: ({ args }) => {
        const expExpr = `clamp(${args.exp ?? 0.5}, -3.0, 3.0)`;

        return `(sign(${args.base ?? 0.5}) * pow(abs(${args.base ?? 0.5}), ${expExpr}))`;
    },
    toMathString: ({ args }) => `(${args.base ?? 0.5}^${args.exp ?? 0.5})`,
} as const satisfies Operator;

export const divOp = {
    arity: 2,
    kind: 'combinator',
    label: 'div',
    argNames: ['a', 'b'],
    evaluate: ({ args }) => {
        if (Math.abs(args.b ?? 0.5) < 1e-6) {
            return 0;
        }

        return clamp((args.a ?? 0.5) / (args.b ?? 0.5));
    },
    toGLSL: ({ args }) =>
        `(abs(${args.b ?? 0.5}) < 1e-6 ? 0.0 : clamp((${args.a ?? 0.5}) / (${args.b ?? 0.5}), -1.0, 1.0))`,
    toMathString: ({ args }) => `(${args.a ?? 0.5} / ${args.b ?? 0.5})`,
} as const satisfies Operator;

export const lessThanOp = {
    arity: 2,
    kind: 'combinator',
    label: '<',
    argNames: ['a', 'b'],
    evaluate: ({ args }) => ((args.a ?? 0.5) < (args.b ?? 0.5) ? 1.0 : -1.0),
    toGLSL: ({ args }) => `(${args.a ?? 0.5} < ${args.b ?? 0.5} ? 1.0 : -1.0)`,
    toMathString: ({ args }) => `(${args.a ?? 0.5} < ${args.b ?? 0.5} ? 1 : -1)`,
} as const satisfies Operator;

export const greaterThanOp = {
    arity: 2,
    kind: 'combinator',
    label: '>',
    argNames: ['a', 'b'],
    evaluate: ({ args }) => ((args.a ?? 0.5) > (args.b ?? 0.5) ? 1.0 : -1.0),
    toGLSL: ({ args }) => `(${args.a ?? 0.5} > ${args.b ?? 0.5} ? 1.0 : -1.0)`,
    toMathString: ({ args }) => `(${args.a ?? 0.5} > ${args.b ?? 0.5} ? 1 : -1)`,
} as const satisfies Operator;

export const ifOp = {
    arity: 3,
    kind: 'combinator',
    label: 'if',
    argNames: ['cond', 'truthy', 'falsy'],
    evaluate: ({ args }) => ((args.cond ?? 0.5) > 0.0 ? (args.truthy ?? 1) : (args.falsy ?? 0)),
    toGLSL: ({ args }) => `(${args.cond ?? 0.5} > 0.0 ? ${args.truthy} : ${args.falsy})`,
    toMathString: ({ args }) => `(if ${args.cond ?? 0.5} > 0 ? ${args.truthy} : ${args.falsy})`,
} as const satisfies Operator;

export const mixOp = {
    arity: 4,
    kind: 'combinator',
    label: 'mix',
    argNames: ['a', 'b', 'c', 'd'],
    evaluate: ({ args }) => {
        const t = clamp((((args.a ?? 0.5) + 1) / 2) * (((args.b ?? 0.5) + 1) / 2));

        return clamp((args.c ?? 0.5) * (1 - t) + (args.d ?? 0.5) * t);
    },
    toGLSL: ({ args }) =>
        `clamp(mix(${args.c ?? 0.5}, ${args.d ?? 0.5}, clamp((${args.a ?? 0.5} + 1.0) * 0.5 * ((${args.b ?? 0.5} + 1.0) * 0.5), -1.0, 1.0)), -1.0, 1.0)`,
    toMathString: ({ args }) =>
        `mix(${args.a ?? 0.5}, ${args.b ?? 0.5}, ${args.c ?? 0.5}, ${args.d ?? 0.5})`,
} as const satisfies Operator;
