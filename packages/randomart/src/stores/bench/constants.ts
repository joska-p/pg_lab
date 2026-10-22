import type { BenchView, CellSize } from './types';

export const CELL_SIZES = ['64', '128', '256'] as const satisfies readonly CellSize[];

export const MAX_BENCH_COUNT = 32;

export const MAX_BENCH_SEEDS = 64;

export const BENCH_VIEWS = ['focus', 'planche'] as const satisfies readonly BenchView[];
