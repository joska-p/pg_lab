import { arithmetic } from './arithmetic';
import { logic } from './logic';
import { terminals } from './terminals';
import { transforms } from './transforms';
import { trigonometry } from './trigonometry';
import type { OperatorSpec } from './types';

export const OPERATOR_SPECS = {
    ...terminals,
    ...arithmetic,
    ...trigonometry,
    ...logic,
    ...transforms,
} satisfies Record<string, OperatorSpec>;

export type OperatorId = keyof typeof OPERATOR_SPECS;
