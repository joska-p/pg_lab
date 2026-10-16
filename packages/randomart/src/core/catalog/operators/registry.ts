import { arithmetic } from './arithmetic.ts';
import { logic } from './logic.ts';
import { terminals } from './terminals.ts';
import { transforms } from './transforms.ts';
import { trigonometry } from './trigonometry.ts';
import type { OperatorSpec } from './types.ts';

export const OPERATOR_SPECS = {
    ...terminals,
    ...arithmetic,
    ...trigonometry,
    ...logic,
    ...transforms,
} satisfies Record<string, OperatorSpec>;

export type OperatorId = keyof typeof OPERATOR_SPECS;
