import type { Expression } from '../expression/types';
import type { Grammar, GrammarData } from '../grammar/types';
import type { Seed } from '../random/seed';
import type { Brand } from '../shared/shared';

/**
 * Raw render settings as callers may write them: partial UI input, parsed JSON files. Carries no
 * guarantee — `createRenderSettings` repairs-checks it, `fitRenderSettings` repairs it
 * (throw-vs-repair policy in shared/index.ts).
 */
export interface RenderSettingsInput {
    readonly width: number;
    readonly height: number;
    readonly loopMs: number;
}

/**
 * Validated render settings: dimensions are integers in [1, MAX_RENDER_SIZE], loopMs is a finite
 * number in [MIN_LOOP_MS, MAX_LOOP_MS]. Reachable only through `createRenderSettings` (vouched
 * callers) or `fitRenderSettings` (repairs file input — the `ZoomClamp` analog).
 */
export type RenderSettings = Brand<RenderSettingsInput, 'RenderSettings'>;

/** Informative origin of the artwork: the expression is the reference. */
export interface Provenance {
    readonly grammar: Grammar;
    readonly seed: Seed;
    readonly generatorVersion: number;
}

/** Outcome of a provenance check. */
export type ProvenanceCheck = 'none' | 'matches' | 'differs' | 'version-mismatch';

export interface ArtworkInput {
    readonly expression: Expression;
    readonly render?: Partial<RenderSettingsInput>;
    readonly provenance?: Provenance;
    readonly title?: string;
}

export type Artwork = Brand<
    {
        readonly expression: Expression;
        readonly render: RenderSettings;
        readonly provenance?: Provenance;
        readonly title?: string; // 1..MAX_TITLE_LENGTH characters
    },
    'Artwork'
>;

// ---------------------------------------------------------------------------
// Serialization DTOs (plain JSON representations)
// ---------------------------------------------------------------------------

/** `.randomart.json` content; key order: format, version, title, render, provenance, expression. */
export interface ArtworkData {
    readonly format: string;
    readonly version: number;
    readonly title?: string;
    readonly render?: RenderSettingsInput;
    readonly provenance?: {
        readonly generatorVersion: number;
        readonly seed: number;
        readonly grammar: GrammarData;
    };
    readonly expression: import('../expression/serialize').ExpressionData;
}
