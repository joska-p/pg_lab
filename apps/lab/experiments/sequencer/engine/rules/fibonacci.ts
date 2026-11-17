import type { SequenceRule } from './types';

export const fibonacciRule = {
    id: 'fibonacci',
    name: 'Fibonacci',
    description: 'F(n) = F(n-1) + F(n-2). Grows exponentially.',
    maxSteps: 20,
    getNext: ({ index, current, sequence }) => {
        if (index <= 1) {
            return index;
        }

        return current + (sequence[index - 2] ?? 0);
    },
} as const satisfies SequenceRule;
