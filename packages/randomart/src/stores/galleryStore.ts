import { create } from 'zustand';

import { DEFAULT_CHANNELS } from '../core/color/index.ts';
import { sampleGrammars } from '../core/grammar/index.ts';
import type { Seed } from '../core/random/index.ts';
import { createSeed, randomSeed } from '../core/random/index.ts';
import { createBatchRenderer } from '../renderer/index.ts';
import type { BatchRenderer, RenderedBatch } from '../renderer/index.ts';
import { catalog } from './catalogueStore.ts';

/** Cell sizes offered: square powers of two ≥ 16, so the analysis descriptors accept them. */
export type CellSize = '32' | '64' | '128';

export const CELL_SIZES = ['32', '64', '128'] as const satisfies readonly CellSize[];

export const MAX_GALLERY_COUNT = 16;
export const MAX_GALLERY_SEEDS = 16;

/**
 * Everything that describes _which_ lot to draw. Editable in the panel, read by the render action:
 * one master copy, no duplication between the panel and the stage.
 */
export interface GallerySettings {
    /** Number of candidate grammars: one row each. */
    readonly count: number;
    /** Images per grammar: one column each. */
    readonly seedsPerGrammar: number;
    readonly cellSize: CellSize;
    readonly filterFlats: boolean;
    /** Base of the sampling draw: the lot is reproducible from it. */
    readonly baseSeed: Seed;
}

const DEFAULT_SETTINGS: GallerySettings = {
    count: 8,
    seedsPerGrammar: 8,
    cellSize: '64',
    filterFlats: false,
    baseSeed: createSeed(1),
};

interface GalleryState {
    settings: GallerySettings;
    /** The drawn lot: one batch per grammar. Empty until the first "New batch". */
    batches: readonly RenderedBatch[];
    /** Message of the last failed lot, null after a success. */
    error: string | null;
}

/**
 * The gallery's domain (conventions §5.3): the lot and how it is drawn. Separate from `appStore`
 * (the workspace: current grammar, expression, history) because the two do not share write
 * authority — the panel edits the lot, the stage shows it, `appStore` never sees it.
 *
 * This is the seed of the notebook store (Lot I, jalon I2), which will give lots an identity, a
 * rating and a memory instead of dropping them on mode switch.
 */
export const store = create<GalleryState>(() => ({
    settings: DEFAULT_SETTINGS,
    batches: [],
    error: null,
}));

/**
 * The offscreen surface of `renderer/batch.ts`, owned by this store: created with the first lot and
 * kept for the app's lifetime, so every lot reuses **one** WebGL context (the whole point of the
 * shared renderer). It is idle — no frame loop — unless a lot is being drawn.
 */

export function useGallerySettings(): GallerySettings {
    return store((state) => state.settings);
}

export function useGalleryBatches(): readonly RenderedBatch[] {
    return store((state) => state.batches);
}

export function useGalleryError(): string | null {
    return store((state) => state.error);
}

function patchSettings(patch: Partial<GallerySettings>): void {
    store.setState((state) => ({ settings: { ...state.settings, ...patch } }));
}

export function setGalleryCount(count: number): void {
    patchSettings({ count });
}

export function setGallerySeeds(seedsPerGrammar: number): void {
    patchSettings({ seedsPerGrammar });
}

export function setGalleryCellSize(cellSize: CellSize): void {
    patchSettings({ cellSize });
}

export function setGalleryFilterFlats(filterFlats: boolean): void {
    patchSettings({ filterFlats });
}

/**
 * The offscreen surface of `renderer/batch.ts`, owned by this store: created with the first lot and
 * kept for the app's lifetime, so every lot reuses **one** WebGL context (the whole point of the
 * shared renderer). It is idle — no frame loop — unless a lot is being drawn.
 */
let renderer: BatchRenderer | null = null;

/** Draws `count` grammars derived from `base` and renders the lot at the current cell size. */
function renderLot(base: Seed): void {
    const { count, seedsPerGrammar, cellSize } = store.getState().settings;

    try {
        renderer ??= createBatchRenderer(catalog);
        const sampled = sampleGrammars(catalog, count, {
            baseSeed: base,
            seedsPerGrammar,
            channels: DEFAULT_CHANNELS,
        });

        store.setState({
            batches: renderer.render(
                sampled.map(({ grammar, seeds }) => ({ grammar, seeds })),
                Number(cellSize),
            ),
            error: null,
        });
    } catch (cause) {
        // Building the surface failed (e.g. no WebGL2) or the context died: drop it so the next lot
        // starts from a fresh one, and report the reason instead of an empty planche.
        renderer?.destroy();
        renderer = null;
        store.setState({
            batches: [],
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

/** "New batch": a fresh draw, same settings. The single writer of `settings.baseSeed`. */
export function newGalleryBatch(): void {
    const baseSeed = randomSeed();

    store.setState((state) => ({ settings: { ...state.settings, baseSeed } }));
    renderLot(baseSeed);
}

/** "Redraw": the same lot again, at the current settings (e.g. bigger cells). */
export function redrawGallery(): void {
    renderLot(store.getState().settings.baseSeed);
}
