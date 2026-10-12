import type { GlslFunctionsIds } from '../../glsl-library';

export type OperatorKind = 'terminal' | 'transform' | 'combinator';

export interface EvalContext {
    x: number;
    y: number;
    t: number;
}

export interface Operator<TArgNames extends readonly string[] = readonly string[]> {
    readonly arity: number;
    readonly kind: OperatorKind;
    readonly label: string;
    readonly argNames: TArgNames;
    evaluate(params: { args: Record<TArgNames[number], number>; ctx: EvalContext }): number;
    toGLSL(params: { args: Record<TArgNames[number], string>; coordVar: string }): string;
    toMathString(params: { args: Record<TArgNames[number], string> }): string;

    readonly noiseDependencies?: readonly GlslFunctionsIds[];
}

/** Identity helper: checks the shape against `Operator`, keeps literal types, infers method params. */
export const defineOperator = <const T extends Operator>(operator: T): T => operator;
