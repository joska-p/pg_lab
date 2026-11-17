import type { SequenceRule } from './types';

export const squareNumbersRule = {
    id: 'square-numbers',
    name: 'Square Numbers',
    description: 'n²: 1, 4, 9, 16, 25, 36... Quadratic growth.',
    maxSteps: 500,
    getNext: ({ index }) => index * index,
} as const satisfies SequenceRule;
