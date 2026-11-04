import { RandomArtError } from './errors';
import { glslFloat } from './glsl';
import type { GlslFunctionId } from './glsl';

/** Coordinates of one pixel: position in [-1, 1]² and animation phase in [0, 1). */
export interface Point {
    readonly x: number;
    readonly y: number;
    readonly phase: number;
}

export interface ParamSpec {
    readonly min: number;
    readonly max: number;
    /** When set, the parameter is drawn from discrete levels instead of continuously. */
    readonly step?: number;
}

export interface GlslArgs {
    /** Inputs as complete GLSL expressions, safe to embed anywhere. */
    readonly inputs: readonly string[];
    readonly params: Readonly<Record<string, number>>;
    /** Coordinate expression of the current frame: `v_p` or a warp context. */
    readonly point: string;
}

export interface EvalArgs {
    /** Inputs as already evaluated values. */
    readonly inputs: readonly number[];
    readonly params: Readonly<Record<string, number>>;
    readonly point: Point;
}

export type OpFamily = 'terminal' | 'arithmetic' | 'trigonometry' | 'logic' | 'transform';

interface BaseOp {
    /** Operator family for pickers; `family === 'terminal'` is equivalent to `arity === 0`. */
    readonly family: OpFamily;
    readonly params?: Readonly<Record<string, ParamSpec>>;
    /** True when the operator reads `u_phase` with these parameters. */
    readonly usesTime?: (params: Readonly<Record<string, number>>) => boolean;
    readonly requires?: readonly GlslFunctionId[];
}

export interface PointwiseOp extends BaseOp {
    readonly kind?: 'pointwise';
    /** Number of child expressions. Zero means the operator is a terminal. */
    readonly arity: number;
    /**
     * GLSL body. `inputs` are complete expressions and may be embedded anywhere.
     *
     * An operator of arity 0 must return a primary expression (call, literal, member access or
     * parenthesized group); the compiler relies on it to decide whether an inline needs wrapping.
     * Every other operator may return any expression.
     */
    readonly glsl: (args: GlslArgs) => string;
    /** CPU reference implementation; must agree with `glsl`. */
    readonly eval: (args: EvalArgs) => number;
}

export interface WarpOp extends BaseOp {
    readonly kind: 'warp';
    /** `dx`, `dy`, then the body. */
    readonly arity: 3;
    /** Coordinates of the body subtree; `inputs` holds the two outer-frame offsets. */
    readonly glslPoint: (args: GlslArgs) => string;
    readonly evalPoint: (args: EvalArgs) => Point;
}

export type OpDef = PointwiseOp | WarpOp;

const MODULATION_PARAMS = {
    amp: { min: 0, max: 1, step: 0.1 },
    phase: { min: 0, max: 1, step: 0.1 },
    cycles: { min: 1, max: 4, step: 1 },
} as const;

function paramValue(
    params: Readonly<Record<string, number>>,
    name: string,
    fallback: number,
): number {
    return params[name] ?? fallback;
}

/**
 * `amp` is the share of time modulation: 0 keeps the coordinate static, 1 replaces it with the
 * oscillation. The GLSL `mix` and this lerp are the same operation.
 */
function modulatedGlsl(
    point: string,
    axis: 'x' | 'y',
    params: Readonly<Record<string, number>>,
): string {
    const amp = paramValue(params, 'amp', 0);
    if (amp === 0) {
        return `${point}.${axis}`;
    }
    const phase = paramValue(params, 'phase', 0);
    const cycles = paramValue(params, 'cycles', 1);
    return `mix(${point}.${axis}, sin(2.0*PI*${glslFloat(cycles)}*u_phase+PI*${glslFloat(phase)}), ${glslFloat(amp)})`;
}

function modulatedValue(
    point: Point,
    axis: 'x' | 'y',
    params: Readonly<Record<string, number>>,
): number {
    const amp = paramValue(params, 'amp', 0);
    if (amp === 0) {
        return point[axis];
    }
    const phase = paramValue(params, 'phase', 0);
    const cycles = paramValue(params, 'cycles', 1);
    const oscillation = Math.sin(2 * Math.PI * cycles * point.phase + Math.PI * phase);
    return point[axis] * (1 - amp) + oscillation * amp;
}

/** JS twin of `ra_fold2`'s component rule. */
function foldComponent(value: number): number {
    const wrapped = (((value + 3) % 4) + 4) % 4;
    return Math.abs(wrapped - 2) - 1;
}

function usesModulation(params: Readonly<Record<string, number>>): boolean {
    return paramValue(params, 'amp', 0) > 0;
}

/** Lit l'opérande de rang `index` et throw s'il manque (garde contre arité violée). */
function operand<T>(inputs: readonly T[], index: number): T {
    const value = inputs[index];
    if (value === undefined) {
        throw new RandomArtError(`Missing operand ${index}`);
    }
    return value;
}

function unary(
    family: OpFamily,
    spec: {
        readonly requires?: readonly GlslFunctionId[];
        readonly glsl: (a: string) => string;
        readonly eval: (a: number) => number;
    },
): PointwiseOp {
    return {
        family,
        arity: 1,
        ...(spec.requires !== undefined && { requires: spec.requires }),
        glsl: ({ inputs }) => spec.glsl(operand(inputs, 0)),
        eval: ({ inputs }) => spec.eval(operand(inputs, 0)),
    };
}

function binary(
    family: OpFamily,
    spec: {
        readonly glsl: (a: string, b: string) => string;
        readonly eval: (a: number, b: number) => number;
    },
): PointwiseOp {
    return {
        family,
        arity: 2,
        glsl: ({ inputs }) => spec.glsl(operand(inputs, 0), operand(inputs, 1)),
        eval: ({ inputs }) => spec.eval(operand(inputs, 0), operand(inputs, 1)),
    };
}

function ternary(
    family: OpFamily,
    spec: {
        readonly glsl: (a: string, b: string, c: string) => string;
        readonly eval: (a: number, b: number, c: number) => number;
    },
): PointwiseOp {
    return {
        family,
        arity: 3,
        glsl: ({ inputs }) => spec.glsl(operand(inputs, 0), operand(inputs, 1), operand(inputs, 2)),
        eval: ({ inputs }) => spec.eval(operand(inputs, 0), operand(inputs, 1), operand(inputs, 2)),
    };
}

const opTable = {
    x: {
        family: 'terminal',
        params: MODULATION_PARAMS,
        usesTime: usesModulation,
        arity: 0,
        glsl: ({ point, params }) => modulatedGlsl(point, 'x', params),
        eval: ({ point, params }) => modulatedValue(point, 'x', params),
    },
    y: {
        family: 'terminal',
        params: MODULATION_PARAMS,
        usesTime: usesModulation,
        arity: 0,
        glsl: ({ point, params }) => modulatedGlsl(point, 'y', params),
        eval: ({ point, params }) => modulatedValue(point, 'y', params),
    },
    const: {
        family: 'terminal',
        params: { value: { min: -1, max: 1 } },
        arity: 0,
        glsl: ({ params }) => {
            const value = paramValue(params, 'value', 0);
            return value < 0 ? `(${glslFloat(value)})` : glslFloat(value);
        },
        eval: ({ params }) => paramValue(params, 'value', 0),
    },
    add: binary('arithmetic', {
        glsl: (a, b) => `(${a}+${b})*0.5`,
        eval: (a, b) => (a + b) * 0.5,
    }),
    sub: binary('arithmetic', {
        glsl: (a, b) => `(${a}-${b})*0.5`,
        eval: (a, b) => (a - b) * 0.5,
    }),
    mul: binary('arithmetic', {
        glsl: (a, b) => `${a}*${b}`,
        eval: (a, b) => a * b,
    }),
    div: binary('arithmetic', {
        glsl: (a, b) => `(${a}/(1.0+abs(${b})))`,
        eval: (a, b) => a / (1 + Math.abs(b)),
    }),
    neg: unary('arithmetic', {
        glsl: (a) => `-(${a})`,
        eval: (a) => -a,
    }),
    abs: unary('arithmetic', {
        glsl: (a) => `abs(${a})`,
        eval: (a) => Math.abs(a),
    }),
    sqr: unary('arithmetic', {
        requires: ['ra_sqr'],
        glsl: (a) => `ra_sqr(${a})`,
        eval: (a) => a * a,
    }),
    min: binary('arithmetic', {
        glsl: (a, b) => `min(${a},${b})`,
        eval: (a, b) => Math.min(a, b),
    }),
    max: binary('arithmetic', {
        glsl: (a, b) => `max(${a},${b})`,
        eval: (a, b) => Math.max(a, b),
    }),
    mix: ternary('arithmetic', {
        glsl: (a, b, c) => `mix(${a},${b},(${c}+1.0)*0.5)`,
        eval: (a, b, c) => a + (b - a) * ((c + 1) * 0.5),
    }),
    sin: unary('trigonometry', {
        glsl: (a) => `sin(PI*${a})`,
        eval: (a) => Math.sin(Math.PI * a),
    }),
    cos: unary('trigonometry', {
        glsl: (a) => `cos(PI*${a})`,
        eval: (a) => Math.cos(Math.PI * a),
    }),
    gt: binary('logic', {
        glsl: (a, b) => `(${a}>${b} ? 1.0 : -1.0)`,
        eval: (a, b) => (a > b ? 1 : -1),
    }),
    select: ternary('logic', {
        glsl: (a, b, c) => `(${a}>0.0 ? ${b} : ${c})`,
        eval: (a, b, c) => (a > 0 ? b : c),
    }),
    warp: {
        kind: 'warp',
        family: 'transform',
        arity: 3,
        requires: ['ra_fold2'],
        glslPoint: ({ inputs, point }) =>
            `ra_fold2(${point}+0.5*vec2(${operand(inputs, 0)},${operand(inputs, 1)}))`,
        evalPoint: ({ inputs, point }) => ({
            x: foldComponent(point.x + 0.5 * operand(inputs, 0)),
            y: foldComponent(point.y + 0.5 * operand(inputs, 1)),
            phase: point.phase,
        }),
    },
} as const satisfies Record<string, OpDef>;

export type OpName = keyof typeof opTable;

/** Operator catalogue, widened to the common contract so `kind` can be read uniformly. */
export const ops: Readonly<Record<OpName, OpDef>> = opTable;

/** Operator names in canonical order: every iteration over the catalogue must use it. */
export const OP_NAMES = (Object.keys(opTable) as OpName[]).sort();

export function isOpName(value: unknown): value is OpName {
    return typeof value === 'string' && Object.hasOwn(opTable, value);
}

/** True when the operator has arity 0 (no child expressions). */
export function isTerminal(name: OpName): boolean {
    return opTable[name].arity === 0;
}

/** Grouping hint for operator pickers, matching the UI taxonomy. */
export function groupOf(name: OpName): OpFamily {
    return opTable[name].family;
}
