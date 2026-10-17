import type { DependencyId } from '../dependencies.ts';

export type OperatorGroup = 'terminal' | 'arithmetic' | 'trigonometry' | 'logic' | 'transform';

export interface ParamRange {
    readonly min: number;
    readonly max: number;
}

type Named<K extends string, V> = Readonly<Record<K, V>>;

/**
 * A registry entry: pure data plus the two text builders. `P`, `I`, `N` are inferred from the
 * literal by `defineOperator`, so `args` and `params` are precisely typed inside the builders; `D`
 * is the set of dependency ids `requires` may name.
 */
export interface OperatorSpec<
    P extends string = string,
    I extends string = string,
    N extends string = string,
    D extends string = string,
> {
    /** Name shown in the UI. */
    readonly label: string;
    readonly group: OperatorGroup;
    readonly params?: Named<P, ParamRange>;
    /** Inputs evaluated in the current coordinate context. */
    readonly inputs?: readonly I[];
    /** Inputs evaluated in the context created by `coords`. Come after `inputs`. */
    readonly inner?: readonly N[];
    /** Ids of shader dependencies (functions, uniforms). */
    readonly requires?: readonly D[];
    /** New coordinates for `inner` inputs; receives the `inputs` only. */
    coords?(c: { p: string; args: Named<I, string>; params: Named<P, number> }): string;
    glsl(c: { p: string; args: Named<I | N, string>; params: Named<P, number> }): string;
}

/** Identity helper: infers `P`, `I`, `N` from the literal so `args` is precisely typed. */
export const defineOperator = <
    P extends string = never,
    I extends string = never,
    N extends string = never,
>(
    spec: OperatorSpec<P, I, N, DependencyId>,
): OperatorSpec<P, I, N, DependencyId> => spec;
