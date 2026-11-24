import type { SequenceRule } from './types';

function stern(n: number): number {
    if (n === 0) {
        return 0;
    }

    if (n === 1) {
        return 1;
    }

    if (n % 2 === 0) {
        return stern(n / 2);
    }

    const k = (n - 1) / 2;

    return stern(k) + stern(k + 1);
}

export const sternDiatomicRule = {
    id: 'stern-diatomic',
    name: "Stern's Diatomic",
    description: 'f(0)=0, f(1)=1; f(2n)=f(n), f(2n+1)=f(n)+f(n+1). Fractal series.',
    maxSteps: 5000,
    getNext: ({ index }) => stern(index),
} as const satisfies SequenceRule;
