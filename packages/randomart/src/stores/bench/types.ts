import type { Seed } from '../../core/random/types';

/** Cell sizes offered: square powers of two ≥ 16, so the analysis descriptors accept them. */
export type CellSize = '64' | '128' | '256';

/**
 * How the lot is presented. `planche` is the contact sheet: every grammar, fitted to the stage.
 * `focus` is one grammar at native cell size — the regime where a single candidate is actually
 * judged.
 */
export type BenchView = 'focus' | 'planche';

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
