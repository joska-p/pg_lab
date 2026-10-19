import type { Expression } from '../expression/index.ts';
import type { Grammar } from '../grammar/index.ts';
import type { Seed } from '../random/index.ts';
import type { Brand } from '../shared/index.ts';

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

export const MIN_RENDER_SIZE = 1;
export const MAX_RENDER_SIZE = 8_192;
export const MIN_LOOP_MS = 500;
export const MAX_LOOP_MS = 120_000;
export const MAX_TITLE_LENGTH = 200;
