import { CONFIG } from '../config/config';
import { assertFinite, assertIntegerInRange } from '../shared/shared';
import {
    MAX_LOOP_MS,
    MAX_RENDER_SIZE,
    MAX_TITLE_LENGTH,
    MIN_LOOP_MS,
    MIN_RENDER_SIZE,
} from './constants';
import type { Artwork, ArtworkInput, RenderSettings, RenderSettingsInput } from './types';

/**
 * The only way to a `RenderSettings` brand: constrains the render block numbers and applies
 * `CONFIG.artwork` for absent fields. Throws for callers who vouch for their values; parse files
 * (external data) through `fitRenderSettings` below. Accepts raw `Partial<RenderSettingsInput>` so
 * callers can hand in UI values or parsed JSON.
 */
export function createRenderSettings(render?: Partial<RenderSettingsInput>): RenderSettings {
    const width = render?.width ?? CONFIG.artwork.width;
    const height = render?.height ?? CONFIG.artwork.height;
    const loopMs = render?.loopMs ?? CONFIG.artwork.loopMs;

    assertIntegerInRange(width, 'render.width', MIN_RENDER_SIZE, MAX_RENDER_SIZE);
    assertIntegerInRange(height, 'render.height', MIN_RENDER_SIZE, MAX_RENDER_SIZE);
    assertFinite(loopMs, 'render.loopMs');

    if (loopMs < MIN_LOOP_MS || loopMs > MAX_LOOP_MS) {
        throw new Error(
            `Randomart: render.loopMs must be between ${MIN_LOOP_MS} and ${MAX_LOOP_MS}, received ${String(loopMs)}`,
        );
    }

    return Object.freeze({ width, height, loopMs }) as RenderSettings;
}

/**
 * Repairs raw render settings into the brand — the `ZoomClamp` analog for the render block, the
 * repair entry for file boundaries (`parseArtworkFile`). Quantities are clamped (rounded) into the
 * concept bounds; a non-finite field is garbage, not an intent, and takes the concept default;
 * absent fields already default in `createRenderSettings`.
 */
export function fitRenderSettings(render?: Partial<RenderSettingsInput>): RenderSettings {
    const clampBounded = (
        value: number | undefined,
        min: number,
        max: number,
        fallback: number,
    ): number =>
        value === undefined || !Number.isFinite(value)
            ? fallback
            : Math.min(max, Math.max(min, Math.round(value)));

    return createRenderSettings({
        width: clampBounded(render?.width, MIN_RENDER_SIZE, MAX_RENDER_SIZE, CONFIG.artwork.width),
        height: clampBounded(
            render?.height,
            MIN_RENDER_SIZE,
            MAX_RENDER_SIZE,
            CONFIG.artwork.height,
        ),
        loopMs: clampBounded(render?.loopMs, MIN_LOOP_MS, MAX_LOOP_MS, CONFIG.artwork.loopMs),
    });
}

/**
 * The only way to an artwork. The expression guard stays throw-first (its shape is duck-typed
 * today; branding it is deliberately out of scope). Bounds throw for vouched callers up to
 * `createRenderSettings`; the title is repaired instead: it is cosmetic metadata, so an artwork is
 * never refused over it (throw-vs-repair policy in shared/index.ts) — an empty title is absent, an
 * oversized one is truncated.
 */
export function createArtwork(input: ArtworkInput): Artwork {
    const { expression, provenance, title: rawTitle } = input;

    if (!expression || typeof expression.r?.operatorName !== 'string') {
        throw new Error('Randomart: expression must be a valid Expression');
    }

    // Title repair (see above): canonical truncation, then "empty means absent".
    const title = typeof rawTitle === 'string' ? rawTitle.slice(0, MAX_TITLE_LENGTH) : undefined;

    const render = createRenderSettings(input.render);

    return Object.freeze({
        expression,
        render,
        ...(provenance !== undefined ? { provenance } : {}),
        ...(title !== undefined && title.length >= 1 ? { title } : {}),
    }) as Artwork;
}
