import { GLSL_PI } from '../../glsl-library';
import { clamp } from '../../util';
import { defineOperator } from './types';

export const xOp = defineOperator({
    arity: 0,
    kind: 'terminal',
    label: 'x',
    argNames: [],
    evaluate: ({ ctx }) => ctx.x,
    toGLSL: ({ coordVar }) => `${coordVar}.x`,
    toMathString: () => 'x',
});

export const yOp = defineOperator({
    arity: 0,
    kind: 'terminal',
    label: 'y',
    argNames: [],
    evaluate: ({ ctx }) => ctx.y,
    toGLSL: ({ coordVar }) => `${coordVar}.y`,
    toMathString: () => 'y',
});

export const constOp = defineOperator({
    arity: 0,
    kind: 'terminal',
    label: 'const',
    argNames: ['value'],
    evaluate: ({ args }) => args.value ?? 0,
    toGLSL: ({ args }) => {
        const num = Number(args.value);

        return isNaN(num) ? '0.0000' : num.toFixed(4);
    },
    toMathString: ({ args }) => args.value ?? '0',
});

export const radialOp = defineOperator({
    arity: 0,
    kind: 'terminal',
    label: 'radial',
    argNames: [],
    evaluate: ({ ctx }) => clamp(Math.sqrt(ctx.x * ctx.x + ctx.y * ctx.y) * 2.0 - 1.0),
    toGLSL: ({ coordVar }) => `(length(${coordVar}) * 2.0 - 1.0)`,
    toMathString: () => 'radial(p)',
});

export const sweepOp = defineOperator({
    arity: 0,
    kind: 'terminal',
    label: 'sweep',
    argNames: [],
    evaluate: ({ ctx }) => clamp((Math.atan2(ctx.y, ctx.x) / Math.PI) * 2.0 - 1.0),
    toGLSL: ({ coordVar }) => `(atan(${coordVar}.y, ${coordVar}.x) / ${GLSL_PI} * 2.0 - 1.0)`,
    toMathString: () => 'sweep(p)',
});

export const randomOp = defineOperator({
    arity: 0,
    kind: 'terminal',
    label: 'random',
    argNames: [],
    evaluate: ({ ctx }) => {
        const dot = Math.abs(ctx.x) * 12.9898 + Math.abs(ctx.y) * 78.233;
        const val = Math.sin(dot) * 43758.5453;

        return clamp((val - Math.floor(val)) * 2.0 - 1.0);
    },
    toGLSL: ({ coordVar }) =>
        `(fract(sin(abs(${coordVar}.x) * 12.9898 + abs(${coordVar}.y) * 78.233) * 43758.5453) * 2.0 - 1.0)`,
    toMathString: () => 'random(p)',
});
