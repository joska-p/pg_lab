import type { Brand } from '../shared/brand';

export type Seed = Brand<number, 'Seed'>;

export interface Rng {
    next(): number;
    int(max: number): number;
    float(min?: number, max?: number): number;
    pick<T>(items: readonly T[]): T;
    weighted<T>(items: readonly T[], weight: (item: T) => number): T;
}
