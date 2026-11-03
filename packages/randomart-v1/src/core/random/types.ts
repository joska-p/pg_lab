import type { Brand } from '../shared/shared';

export type Seed = Brand<number, 'Seed'>;

export interface Rng {
    readonly next: () => number;
    readonly int: (maxExclusive: number) => number;
    readonly weighted: <T>(items: readonly T[], weightOf: (item: T) => number) => T;
}
