import type { SequenceRule } from './types';

export const triangularRule = {
    id: 'triangular',
    name: 'Triangular',
    description: 'Sum of integers up to n: 1, 3, 6, 10, 15...',
    maxSteps: 500,
    getNext: ({ index }) => (index * (index + 1)) / 2,
} as const satisfies SequenceRule;
