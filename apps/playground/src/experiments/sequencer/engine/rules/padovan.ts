import type { SequenceRule } from './types';

export const padovanRule = {
    id: 'padovan',
    name: 'Padovan',
    description: 'P(n) = P(n-2) + P(n-3). Begins 1, 1, 1, 2, 2, 3, 4, 5, 7, 9...',
    maxSteps: 200,
    getNext: ({ index, sequence }) => {
        if (index <= 2) {
            return 1;
        }

        return (sequence[index - 2] ?? 0) + (sequence[index - 3] ?? 0);
    },
} as const satisfies SequenceRule;
