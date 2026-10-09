import { OPERATORS } from '../operators/registry';
import type { OperatorId } from '../operators/registry';
import type { Rule } from './registry';

const allOperatorIds = Object.keys(OPERATORS) as OperatorId[];

export const classicRule = {
    id: 'classic',
    label: 'Classic',
    kind: 'classic' as const,
    operatorIds: ['x', 'y', 'const', 'sum', 'product', 'sin', 'cos'] as OperatorId[],
    minDepth: 4,
    maxDepth: 8,
} as const satisfies Rule;

export const paperRule = {
    id: 'paper',
    label: 'Paper',
    kind: 'classic' as const,
    operatorIds: [
        'x',
        'y',
        'const',
        'sum',
        'product',
        'sin',
        'cos',
        'exp',
        'sqrt',
        'div',
        'mix',
    ] as OperatorId[],
    minDepth: 4,
    maxDepth: 8,
} as const satisfies Rule;

export const flowRule = {
    id: 'flow',
    label: 'Flow',
    kind: 'classic' as const,
    operatorIds: [
        'x',
        'y',
        'const',
        'if',
        'less-than',
        'greater-than',
        'mix',
        'sum',
        'product',
    ] as OperatorId[],
    minDepth: 4,
    maxDepth: 8,
} as const satisfies Rule;

export const fatRule = {
    id: 'fat',
    label: 'All Operators',
    kind: 'classic' as const,
    operatorIds: allOperatorIds,
    minDepth: 4,
    maxDepth: 8,
} as const satisfies Rule;
