import { GLSL_PI } from '../../glsl-library';
import { clamp } from '../../util';
import { defineOperator } from './types';

export const absOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'abs',
    argNames: ['value'],
    evaluate: ({ args }) => clamp(Math.abs(args.value ?? 0.5) * 2 - 1),
    toGLSL: ({ args }) => `clamp(abs(${args.value ?? 0.5}) * 2.0 - 1.0, -1.0, 1.0)`,
    toMathString: ({ args }) => `(2·|${args.value ?? 0.5}| − 1)`,
});

export const sqrtOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'sqrt',
    argNames: ['value'],
    evaluate: ({ args }) => clamp(Math.sqrt(Math.abs(args.value ?? 0.5) + 1e-10)),
    toGLSL: ({ args }) => `sqrt(abs(${args.value ?? 0.5}) + 1e-10)`,
    toMathString: ({ args }) => `sqrt(|${args.value ?? 0.5}|)`,
});

export const expOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'exp',
    argNames: ['value'],
    evaluate: ({ args }) => {
        const val = Math.max(-1.0, Math.min(1.0, args.value ?? 0.5));

        return clamp(((Math.exp(val) - 0.36787944117) / 2.35040238729) * 2.0 - 1.0);
    },
    toGLSL: ({ args }) => {
        const inner = `clamp(${args.value ?? 0.5}, -1.0, 1.0)`;

        return `(((exp(${inner}) - 0.36787944117) / 2.35040238729) * 2.0 - 1.0)`;
    },
    toMathString: ({ args }) => `normalized_e^(${args.value ?? 0.5})`,
});

export const logOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'log',
    argNames: ['value'],
    evaluate: ({ args }) => {
        const val = Math.abs(args.value ?? 0.5);

        return clamp((Math.log(val + 1.0) / 0.69314718056) * 2.0 - 1.0);
    },
    toGLSL: ({ args }) => `((log(abs(${args.value ?? 0.5}) + 1.0) / 0.69314718056) * 2.0 - 1.0)`,
    toMathString: ({ args }) => `normalized_log(${args.value ?? 0.5})`,
});

export const fractOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'fract',
    argNames: ['value'],
    evaluate: ({ args }) =>
        clamp(((args.value ?? 0.5) - Math.floor(args.value ?? 0.5)) * 2.0 - 1.0),
    toGLSL: ({ args }) => `(fract(${args.value ?? 0.5}) * 2.0 - 1.0)`,
    toMathString: ({ args }) => `fract(${args.value ?? 0.5})`,
});

export const sinOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'sin',
    argNames: ['value'],
    evaluate: ({ args }) => clamp(Math.sin(Math.PI * (args.value ?? 0.5))),
    toGLSL: ({ args }) => `sin(${GLSL_PI} * (${args.value ?? 0.5}))`,
    toMathString: ({ args }) => `sin(π·${args.value ?? 0.5})`,
});

export const cosOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'cos',
    argNames: ['value'],
    evaluate: ({ args }) => clamp(Math.cos(Math.PI * (args.value ?? 0.5))),
    toGLSL: ({ args }) => `cos(${GLSL_PI} * (${args.value ?? 0.5}))`,
    toMathString: ({ args }) => `cos(π·${args.value ?? 0.5})`,
});

export const oscOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'osc/t',
    argNames: ['value'],
    // Oscillates the input slowly over time within a perfect [-1, 1] bounds
    evaluate: ({ args, ctx }) => Math.sin((args.value ?? 0.5) + ctx.t * 0.5),
    toGLSL: ({ args }) => `sin(${args.value ?? 0.5} + u_clockTime * 0.5)`,
    toMathString: ({ args }) => `osc(${args.value})`,
});

export const shiftOp = defineOperator({
    arity: 1,
    kind: 'transform',
    label: 'shift/t',
    argNames: ['value'],
    // Constantly shifts the phase of the inner sub-tree over time
    evaluate: ({ args, ctx }) => {
        const shifted = (args.value ?? 0.5) + ctx.t * 0.2;

        // Keep it wrapped between [-1, 1] cleanly
        return ((shifted + 1) % 2) - 1;
    },
    toGLSL: ({ args }) => `(mod(${args.value} + u_clockTime * 0.2 + 1.0, 2.0) - 1.0)`,
    toMathString: ({ args }) => `shift(${args.value})`,
});
