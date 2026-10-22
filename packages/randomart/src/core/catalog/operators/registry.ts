import type { OperatorSpec, DependencyId } from '../types';
import { arithmetic } from './arithmetic';
import { logic } from './logic';
import { terminals } from './terminals';
import { transforms } from './transforms';
import { trigonometry } from './trigonometry';

/** Registry of all operator specs, keyed by operator name. */
export const operatorRegistry = {
    ...terminals,
    ...arithmetic,
    ...trigonometry,
    ...logic,
    ...transforms,
} satisfies Record<string, OperatorSpec<string, string, string, DependencyId>>;

/** Opaque key into the operator registry. Inferred from the registry keys. */
export type OperatorId = keyof typeof operatorRegistry;

/** Type of the operator registry (for internal use). */
export type OperatorRegistry = typeof operatorRegistry;
