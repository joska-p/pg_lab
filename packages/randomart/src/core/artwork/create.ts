import { assertFinite } from '../shared/index.ts';
import type { Artwork, ArtworkInput, RenderSettings } from './types.ts';
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

function assertInteger(value: number, label: string, min: number, max: number): void {
    assertFinite(value, label);

    if (!Number.isInteger(value)) {
        throw new Error(`${label} must be an integer, received ${value}`);
    }

    if (value < min || value > max) {
        throw new Error(`${label} must be between ${min} and ${max}, received ${value}`);
    }
}

/** Reads and validates `render`; absent fields take the spec defaults (1024², 8000 ms — D36). */
function readRender(render: ArtworkInput['render']): RenderSettings {
    const width = render?.width ?? DEFAULT_RENDER_WIDTH;
    const height = render?.height ?? DEFAULT_RENDER_HEIGHT;
    const loopMs = render?.loopMs ?? DEFAULT_LOOP_MS;

    assertInteger(width, 'render.width', MIN_RENDER_SIZE, MAX_RENDER_SIZE);
    assertInteger(height, 'render.height', MIN_RENDER_SIZE, MAX_RENDER_SIZE);
    assertFinite(loopMs, 'render.loopMs');

    if (loopMs < MIN_LOOP_MS || loopMs > MAX_LOOP_MS) {
        throw new Error(
            `render.loopMs must be between ${MIN_LOOP_MS} and ${MAX_LOOP_MS}, received ${loopMs}`,
        );
    }

    return { width, height, loopMs };
}

/**
 * The only way to an artwork: validates every field, applies the render defaults. An invalid
 * artwork cannot exist; errors carry the guilty field (`render.loopMs: ...`).
 */
export function createArtwork(input: ArtworkInput): Artwork {
    const { expression, provenance, title } = input;

    if (!expression || typeof expression.r?.operatorName !== 'string') {
        throw new Error('expression must be a valid Expression');
    }

    if (title !== undefined) {
        if (typeof title !== 'string') {
            throw new Error('title must be a string');
        }

        if (title.length < 1 || title.length > MAX_TITLE_LENGTH) {
            throw new Error(`title must be 1 to ${MAX_TITLE_LENGTH} characters long`);
        }
    }

    const render = readRender(input.render);

    return Object.freeze({
        expression,
        render: Object.freeze(render),
        ...(provenance !== undefined ? { provenance } : {}),
        ...(title !== undefined ? { title } : {}),
    }) as Artwork;
}
