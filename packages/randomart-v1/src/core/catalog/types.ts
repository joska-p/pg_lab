import type { ParamRange } from '../config/types';

/**
 * A registry entry: pure data plus the two text builders. `P`, `I`, `N` are inferred from the
 * literal by `defineOperator`, so `args` and `params` are precisely typed inside the builders; `D`
 * is the set of dependency ids `requires` may name.
 *
 * Contract: every operator takes inputs in [-1, 1] and returns a finite value in [-1, 1] (to
 * ~1e-6), for any input, with no error case. That is why there is no raw log, sqrt, tan or
 * division. `coords` must return coordinates inside [-1, 1]², hence `ra_fold2`. GLSL is the only
 * semantics: there is no CPU evaluator.
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

type Named<K extends string, V> = Readonly<Record<K, V>>;

export type OperatorGroup = 'terminal' | 'arithmetic' | 'trigonometry' | 'logic' | 'transform';

/** A shader dependency: a GLSL uniform or function with its declared requirements. */
export type DependencySpec<Id extends string = string> =
    | { readonly kind: 'uniform'; readonly glslType: 'float' }
    | { readonly kind: 'function'; readonly code: string; readonly requires?: readonly Id[] };

/** Opaque key into the dependency registry (uniforms: `u_*`, functions: `ra_*`). */
export type DependencyId = string;

/** Opaque key into the operator registry. */
export type OperatorId = string;

/** A dependency with its name attached (used by `Catalog.dependencies()`). */
export type ShaderDependency = DependencySpec & { readonly name: string };

/** Public interface of the Catalog class. */
export interface Catalog {
    operator(name: string): import('./operators/Operator').Operator;
    operators(): readonly import('./operators/Operator').Operator[];
    terminals(): readonly import('./operators/Operator').Operator[];
    dependencies(): readonly ShaderDependency[];
    dependencyClosure(ids: readonly string[]): readonly ShaderDependency[];
}
