import type { DependencyId } from '../dependencies';
import type { OperatorSpec } from './types';

/** Identity helper: infers `P`, `I`, `N` from the literal so `args` is precisely typed. */
export const defineOperator = <
    P extends string = never,
    I extends string = never,
    N extends string = never,
>(
    spec: OperatorSpec<P, I, N, DependencyId>,
): OperatorSpec<P, I, N, DependencyId> => spec;
