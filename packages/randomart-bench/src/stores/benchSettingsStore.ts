import { CONFIG } from '@repo/randomart-core/config/config';
import { createSeed, randomSeed } from '@repo/randomart-core/random/seed';
import type { Seed } from '@repo/randomart-core/random/seed';
import { create } from 'zustand';

/** Cell sizes offered: square powers of two ≥ 16, so the analysis descriptors accept them. */
export type CellSize = '64' | '128' | '256';
export const CELL_SIZES = ['64', '128', '256'] as const satisfies readonly CellSize[];

export const MAX_BENCH_COUNT = 32;
export const MAX_BENCH_SEEDS = 64;

/**
 * How the lot is presented. `planche` is the contact sheet: every grammar, fitted to the stage.
 * `focus` is one grammar at native cell size — the regime where a single candidate is actually
 * judged.
 */
export type BenchView = 'focus' | 'planche';
export const BENCH_VIEWS = ['focus', 'planche'] as const satisfies readonly BenchView[];

/**
 * Everything that describes _which_ lot to draw and _how_ to show it. Editable in the panel, read
 * by the render action: one master copy, no duplication between the panel and the stage.
 */
export interface BenchSettings {
    readonly count: number;
    readonly seedsPerGrammar: number;
    readonly cellSize: CellSize;
    readonly view: BenchView;
    readonly dimFlats: boolean;
    readonly baseSeed: Seed;
}

const DEFAULT_SETTINGS: BenchSettings = {
    count: 12,
    seedsPerGrammar: CONFIG.sampling.benchSeedsPerGrammar,
    cellSize: '128',
    view: 'focus',
    dimFlats: false,
    baseSeed: createSeed(CONFIG.sampling.baseSeed),
};

interface BenchSettingsState {
    settings: BenchSettings;
}

const store = create<BenchSettingsState>(() => ({
    settings: DEFAULT_SETTINGS,
}));

export function useBenchSettings(): BenchSettings {
    return store((state) => state.settings);
}

export function getBenchSettings(): BenchSettings {
    return store.getState().settings;
}

function patchSettings(patch: Partial<BenchSettings>): void {
    store.setState((state) => ({ settings: { ...state.settings, ...patch } }));
}

export function setBenchCount(count: number): void {
    patchSettings({ count });
}

export function setBenchSeeds(seedsPerGrammar: number): void {
    patchSettings({ seedsPerGrammar });
}

export function setBenchCellSize(cellSize: CellSize): void {
    patchSettings({ cellSize });
}

export function setBenchView(view: BenchView): void {
    patchSettings({ view });
}

export function setBenchDimFlats(dimFlats: boolean): void {
    patchSettings({ dimFlats });
}

export function setBenchBaseSeed(baseSeed: Seed): void {
    patchSettings({ baseSeed });
}

export function resetBenchBaseSeed(): void {
    patchSettings({ baseSeed: randomSeed() });
}
