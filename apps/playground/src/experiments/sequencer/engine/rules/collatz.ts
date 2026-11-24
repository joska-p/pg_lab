import type { SequenceRule } from './types';

export const collatzRule = {
    id: 'collatz',
    name: 'Collatz (3n+1)',
    description: 'If even, n/2; if odd, 3n+1. The famous hailstone sequence.',
    maxSteps: 10000,
    getNext: ({ current }) => {
        if (current <= 1) {
            return 1;
        }

        return current % 2 === 0 ? current / 2 : 3 * current + 1;
    },
} as const satisfies SequenceRule;
