import type { SequenceRule } from './types';

function isPrime(num: number): boolean {
    if (num <= 1) {
        return false;
    }

    if (num <= 3) {
        return true;
    }

    if (num % 2 === 0) {
        return false;
    }

    for (let i = 3, s = Math.sqrt(num); i <= s; i += 2) {
        if (num % i === 0) {
            return false;
        }
    }

    return true;
}

export const primesRule = {
    id: 'primes',
    name: 'Primes',
    description: 'The sequence of prime numbers: 2, 3, 5, 7, 11...',
    maxSteps: 300,
    getNext: ({ current }) => {
        const start = current;
        let next = start + 1;

        while (!isPrime(next)) {
            next++;
        }

        return next;
    },
} as const satisfies SequenceRule;
