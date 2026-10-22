import { create } from 'zustand';

import { CONFIG } from '../../core/config/config';
import { createSeed, randomSeed } from '../../core/random/seed';
import type { Seed } from '../../core/random/types';
import type { BenchSettings, BenchView, CellSize } from './types';

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
