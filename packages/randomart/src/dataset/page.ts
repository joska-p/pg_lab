import { deserializeGrammar, serializeGrammar } from '../core/artwork/index.ts';
import type { GrammarData } from '../core/artwork/index.ts';
import { createDefaultCatalog } from '../core/catalog/index.ts';
import { GENERATOR_VERSION } from '../core/generator/index.ts';
import { sampleGrammars } from '../core/grammar/index.ts';
import type { SampleOptions } from '../core/grammar/index.ts';
import { createSeed } from '../core/random/index.ts';
import { createBatchRenderer } from '../renderer/batch.ts';

/**
 * Dataset page: the in-browser half of the offline dataset pipeline. It owns no rendering of its
 * own any more — the GPU work lives in `src/renderer/batch.ts` (the same renderer the bench uses).
 * This file is only the wire adapter: a serialization boundary for `scripts/dataset/generate.mjs`,
 * which drives it through `window.datasetApi`. Images are drawn at phase 0, one program at a time,
 * on the renderer's single reused surface.
 */
const catalog = createDefaultCatalog();
const renderer = createBatchRenderer(catalog);

function bytesToBase64(bytes: Uint8Array): string {
    const CHUNK = 0x8000;
    let binary = '';

    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }

    return btoa(binary);
}

export interface RenderedGrammar {
    /** One flag per seed: false when generation, compilation or the driver refused the image. */
    readonly ok: readonly boolean[];
    /** One message per seed, null on success. */
    readonly errors: readonly (string | null)[];
    /** Base64 of `seeds.length * size * size * 3` bytes: RGB, rows top to bottom, zeros on failure. */
    readonly rgb: string;
}

function renderGrammar(
    grammarData: GrammarData,
    seeds: readonly number[],
    size: number,
): RenderedGrammar {
    const [batch] = renderer.render(
        [{ grammar: deserializeGrammar(catalog, grammarData), seeds: seeds.map(createSeed) }],
        size,
    );

    if (!batch) {
        throw new Error('Batch renderer returned no batch for one request');
    }

    const ok: boolean[] = [];
    const errors: (string | null)[] = [];
    const rgb = new Uint8Array(seeds.length * size * size * 3);
    const imageBytes = size * size * 3;

    batch.cells.forEach((cell, index) => {
        ok.push(cell.error === null);
        errors.push(cell.error);

        // A failed image stays all zeros: the dataset contract (`ok[]` flags them, the offline side
        // never reads the pixels of a false cell).
        if (cell.image) {
            rgb.set(cell.image.rgb, index * imageBytes);
        }
    });

    return { ok, errors, rgb: bytesToBase64(rgb) };
}

function sample(count: number, options: SampleOptions) {
    return {
        generatorVersion: GENERATOR_VERSION,
        items: sampleGrammars(catalog, count, options).map(({ grammar, seeds }) => ({
            grammar: serializeGrammar(grammar),
            seeds: [...seeds] as number[],
        })),
    };
}

const datasetApi = { sample, renderGrammar };

export type DatasetApi = typeof datasetApi;

declare global {
    interface Window {
        datasetApi?: DatasetApi;
    }
}

window.datasetApi = datasetApi;
