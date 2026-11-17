import type { Budget, Signal } from './types';

export function createSimpleSignal(fn: (n: number) => number, budget: Budget): Signal {
    let n = 0;
    let produced = 0;

    return {
        get produced() {
            return produced;
        },

        next(): IteratorResult<number> {
            if (produced >= budget.maxTerms) {
                return { value: undefined, done: true };
            }

            const value = fn(n);

            n += 1;
            produced += 1;

            return { value, done: false };
        },

        take(count: number): number[] {
            const result: number[] = [];
            const limit = Math.min(count, budget.maxTerms - produced);

            for (let i = 0; i < limit; i++) {
                const res = this.next();

                if (res.done) {
                    break;
                }

                result.push(res.value);
            }

            return result;
        },
    };
}
