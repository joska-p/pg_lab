import type { Expression } from '../expression/index.ts';
import type { Grammar } from '../grammar/index.ts';
import type { Seed } from '../random/index.ts';
import type { Brand } from '../shared/index.ts';

/** Output canvas settings the renderer reads from the artwork. */
export interface RenderSettings {
    readonly width: number; // integer, 1..MAX_RENDER_SIZE
    readonly height: number; // integer, 1..MAX_RENDER_SIZE
    readonly loopMs: number; // finite, MIN_LOOP_MS..MAX_LOOP_MS
}

/** Informative origin of the artwork: the expression is the reference (D1). */
export interface Provenance {
    readonly grammar: Grammar;
    readonly seed: Seed;
    readonly generatorVersion: number;
}

export interface ArtworkInput {
    readonly expression: Expression;
    readonly render?: Partial<RenderSettings>;
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

export const DEFAULT_RENDER_WIDTH = 1_024;
export const DEFAULT_RENDER_HEIGHT = 1_024;
export const DEFAULT_LOOP_MS = 8_000;
