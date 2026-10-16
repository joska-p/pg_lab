import { assertFinite, assertIntegerInRange } from '../shared/index.ts';
import type { Artwork, ArtworkInput, RenderSettings, RenderSettingsInput } from './types.ts';
import {
    DEFAULT_LOOP_MS,
    DEFAULT_RENDER_HEIGHT,
    DEFAULT_RENDER_WIDTH,
    MAX_LOOP_MS,
    MAX_RENDER_SIZE,
    MAX_TITLE_LENGTH,
    MIN_LOOP_MS,
    MIN_RENDER_SIZE,
} from './types.ts';

/**
 * The only way to a `RenderSettings` brand (findings F13): validates every field, absent fields
 * take the spec defaults (1024², 8000 ms — D36). Accepts raw `Partial<RenderSettingsInput>` so
 * callers can hand in UI values or parsed JSON.
 */
export function createRenderSettings(render?: Partial<RenderSettingsInput>): RenderSettings {
    const width = render?.width ?? DEFAULT_RENDER_WIDTH;
    const height = render?.height ?? DEFAULT_RENDER_HEIGHT;
    const loopMs = render?.loopMs ?? DEFAULT_LOOP_MS;

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
 * The only way to an artwork: validates every field, applies the render defaults. An invalid
 * artwork cannot exist; errors carry the guilty field (`render.loopMs: ...`).
 */
export function createArtwork(input: ArtworkInput): Artwork {
    const { expression, provenance, title } = input;

    if (!expression || typeof expression.r?.operatorName !== 'string') {
        throw new Error('Randomart: expression must be a valid Expression');
    }

    if (title !== undefined) {
        if (typeof title !== 'string') {
            throw new Error('Randomart: title must be a string');
        }

        if (title.length < 1 || title.length > MAX_TITLE_LENGTH) {
            throw new Error(`Randomart: title must be 1 to ${MAX_TITLE_LENGTH} characters long`);
        }
    }

    const render = createRenderSettings(input.render);

    return Object.freeze({
        expression,
        render,
        ...(provenance !== undefined ? { provenance } : {}),
        ...(title !== undefined ? { title } : {}),
    }) as Artwork;
}
