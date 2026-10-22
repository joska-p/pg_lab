import { createDurationSeconds } from '@repo/glaze/core/time';

import { createArtwork } from '../../core/artwork/create';
import { checkProvenance } from '../../core/artwork/provenance';
import { parseArtworkFile, serializeArtworkFile } from '../../core/artwork/serialize';
import type { Artwork } from '../../core/artwork/types';
import { catalog } from '../../core/catalog/default';
import { compile } from '../../core/compiler/compile';
import { CONFIG } from '../../core/config/config';
import { generate, GENERATOR_VERSION } from '../../core/generator/generator';
import { channelModelOf } from '../../core/grammar/grammar';
import type { Grammar } from '../../core/grammar/types';
import type { Seed } from '../../core/random/types';
import { getLabState, publishLabState, setActionError, setDuration } from './labStore';

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();
    // The download starts after click() returns: defer the revocation.
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

/**
 * Publishes an imported artwork: the expression is shown as-is, the grammar and seed come from its
 * provenance when present, and the liveness of its provenance is computed once. Render size is
 * ignored: render size = canvas size until the artwork is resized; the loop duration is adopted
 * when the UI bounds allow it.
 */
function publishArtwork(artwork: Artwork): void {
    const { expression, provenance, render } = artwork;
    const state = getLabState();
    const grammar = provenance?.grammar ?? state.grammar;
    const seed = provenance?.seed ?? state.seed;
    const compiledShader = compile(catalog, expression, {
        channels: channelModelOf(grammar),
    });
    const provenanceCheck = checkProvenance(artwork);

    publishLabState({ grammar, seed, expression, provenanceCheck, compiledShader });

    // Adopt loop duration directly; render.loopMs is already validated within bounds.
    if (render.loopMs / 1000 !== state.duration) {
        setDuration(createDurationSeconds(render.loopMs / 1000));
    }
}

/** Publishes `(grammar, seed)` as a fresh artwork: the bench's "open in Lab" entry point. */
export function openCellInLab(grammar: Grammar, seed: Seed): void {
    const artwork = createArtwork({
        expression: generate(grammar, seed),
        provenance: { grammar, seed, generatorVersion: GENERATOR_VERSION },
    });

    publishArtwork(artwork);
}

export function exportArtworkFile(): void {
    const state = getLabState();
    const artwork = createArtwork({
        expression: state.expression,
        // Retains default render size so exported files stay consistent across displays.
        render: {
            width: CONFIG.artwork.width,
            height: CONFIG.artwork.height,
            loopMs: Math.round(state.duration * 1000),
        },
        provenance: {
            grammar: state.grammar,
            seed: state.seed,
            generatorVersion: GENERATOR_VERSION,
        },
    });

    downloadBlob(
        new Blob([serializeArtworkFile(artwork)], { type: 'application/json' }),
        `randomart-${Date.now()}.randomart.json`,
    );
}

/**
 * Imports an artwork file and publishes its expression as-is; invalid files leave the state
 * untouched (the error is shown).
 */
export async function importArtworkFile(file: File): Promise<void> {
    try {
        publishArtwork(parseArtworkFile(await file.text()));
    } catch (error) {
        setActionError(error);
    }
}

export async function exportPng(): Promise<void> {
    const { canvas } = getLabState();

    if (!canvas) {
        return;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (!blob) {
        return;
    }

    downloadBlob(blob, `randomart-${Date.now()}.png`);
}
