import { createSimpleSignal } from '../core/create-simple-signal';
import type { Budget, Module } from '../core/types';

export const naturalsModule = {
    id: 'naturals',
    name: 'Natural numbers',
    description: 'a(n) = n  (0, 1, 2, 3, …)',

    createSignal(budget: Budget) {
        return createSimpleSignal((n) => n, budget);
    },
} as const satisfies Module;
