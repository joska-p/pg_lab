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
    /** Grouping hint for operator pickers. Terminals are recognised by `arity === 0`. */
    readonly family?: OpFamily;
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
    add: {
        family: 'arithmetic',
        arity: 2,
        glsl: ({ inputs }) => `(${inputs[0]}+${inputs[1]})*0.5`,
        eval: ({ inputs }) => (inputs[0] + inputs[1]) * 0.5,
    },
    sub: {
        family: 'arithmetic',
        arity: 2,
        glsl: ({ inputs }) => `(${inputs[0]}-${inputs[1]})*0.5`,
        eval: ({ inputs }) => (inputs[0] - inputs[1]) * 0.5,
    },
    mul: {
        family: 'arithmetic',
        arity: 2,
        glsl: ({ inputs }) => `${inputs[0]}*${inputs[1]}`,
        eval: ({ inputs }) => inputs[0] * inputs[1],
    },
    div: {
        family: 'arithmetic',
        arity: 2,
        glsl: ({ inputs }) => `(${inputs[0]}/(1.0+abs(${inputs[1]})))`,
        eval: ({ inputs }) => inputs[0] / (1 + Math.abs(inputs[1])),
    },
    neg: {
        family: 'arithmetic',
        arity: 1,
        glsl: ({ inputs }) => `-(${inputs[0]})`,
        eval: ({ inputs }) => -inputs[0],
    },
    abs: {
        family: 'arithmetic',
        arity: 1,
        glsl: ({ inputs }) => `abs(${inputs[0]})`,
        eval: ({ inputs }) => Math.abs(inputs[0]),
    },
    sqr: {
        family: 'arithmetic',
        arity: 1,
        requires: ['ra_sqr'],
        glsl: ({ inputs }) => `ra_sqr(${inputs[0]})`,
        eval: ({ inputs }) => inputs[0] * inputs[0],
    },
    min: {
        family: 'arithmetic',
        arity: 2,
        glsl: ({ inputs }) => `min(${inputs[0]},${inputs[1]})`,
        eval: ({ inputs }) => Math.min(inputs[0], inputs[1]),
    },
    max: {
        family: 'arithmetic',
        arity: 2,
        glsl: ({ inputs }) => `max(${inputs[0]},${inputs[1]})`,
        eval: ({ inputs }) => Math.max(inputs[0], inputs[1]),
    },
    mix: {
        family: 'arithmetic',
        arity: 3,
        glsl: ({ inputs }) => `mix(${inputs[0]},${inputs[1]},(${inputs[2]}+1.0)*0.5)`,
        eval: ({ inputs }) => inputs[0] + (inputs[1] - inputs[0]) * ((inputs[2] + 1) * 0.5),
    },
    sin: {
        family: 'trigonometry',
        arity: 1,
        glsl: ({ inputs }) => `sin(PI*${inputs[0]})`,
        eval: ({ inputs }) => Math.sin(Math.PI * inputs[0]),
    },
    cos: {
        family: 'trigonometry',
        arity: 1,
        glsl: ({ inputs }) => `cos(PI*${inputs[0]})`,
        eval: ({ inputs }) => Math.cos(Math.PI * inputs[0]),
    },
    gt: {
        family: 'logic',
        arity: 2,
        glsl: ({ inputs }) => `(${inputs[0]}>${inputs[1]} ? 1.0 : -1.0)`,
        eval: ({ inputs }) => (inputs[0] > inputs[1] ? 1 : -1),
    },
    select: {
        family: 'logic',
        arity: 3,
        glsl: ({ inputs }) => `(${inputs[0]}>0.0 ? ${inputs[1]} : ${inputs[2]})`,
        eval: ({ inputs }) => (inputs[0] > 0 ? inputs[1] : inputs[2]),
    },
    warp: {
        kind: 'warp',
        family: 'transform',
        arity: 3,
        requires: ['ra_fold2'],
        glslPoint: ({ inputs, point }) => `ra_fold2(${point}+0.5*vec2(${inputs[0]},${inputs[1]}))`,
        evalPoint: ({ inputs, point }) => ({
            x: foldComponent(point.x + 0.5 * inputs[0]),
            y: foldComponent(point.y + 0.5 * inputs[1]),
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
    const op = opTable[name];
    return op.family ?? 'arithmetic';
}
