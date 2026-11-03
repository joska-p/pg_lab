import type { CanvasDimension, DevicePixelRatio } from '@repo/glaze/core/render';

import type { Grammar } from '../grammar/types';
import type { Seed } from '../random/types';
import type { Brand } from '../shared/shared';

/**
 * The pixel contract the renderer produces. It is shared by the batch renderer, the Bench and the
 * dataset, so it lives in the deepest directory common to them (§2.6): the renderer cluster.
 *
 * The cheap flatness check on that image lives in `./flatness`, next to this type.
 */
export interface RgbImage {
    readonly width: number;
    readonly height: number;
    /** Interleaved RGB bytes, rows top to bottom. */
    readonly rgb: Uint8Array;
}

export interface BatchRequest {
    readonly grammar: Grammar;
    readonly seeds: readonly Seed[];
}

export interface RenderedCell {
    readonly error: string | null;
    readonly image: RgbImage | null;
}

export interface RenderedBatch {
    readonly grammar: Grammar;
    readonly cells: readonly RenderedCell[];
}

/**
 * Renders `(grammar, seed)` images on a reused offscreen surface. Used by the bench and the offline
 * dataset pipeline so both go through the exact same pixels.
 *
 * Failures are values per cell, not exceptions: a shader the driver refuses is a normal outcome,
 * and one dead cell must not abort a lot. Only surface creation can throw (e.g., no WebGL2).
 */
export interface BatchRenderer {
    render(requests: readonly BatchRequest[], size: number): readonly RenderedBatch[];
    destroy(): void;
}

/**
 * Normalized loop phase in [0, 1). Brand guarantees wrapping: only `createPhase` produces a
 * `Phase`, so nothing can inject 0.999… or stale 1.0 into `RenderKey` or `u_phase`.
 *
 * `Phase` brand is randomart-owned; glaze has none, its `Clock.progress` is raw [0, 1].
 */
export type Phase = Brand<number, 'Phase'>;

/**
 * What the last drawn frame depended on. Every field is a validated brand: the phase in [0, 1)
 * comes from `createPhase`, the CSS dimensions from `createCanvasDimension` (glaze) and the DPR is
 * carried from the surface untouched instead of being widened back to `number`.
 */
export interface RenderKey {
    readonly phase: Phase;
    readonly width: CanvasDimension;
    readonly height: CanvasDimension;
    readonly dpr: DevicePixelRatio;
    /** True when the shader reads `u_phase`, so a phase change alters the picture. */
    readonly animated: boolean;
}
