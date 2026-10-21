import { deserializeGrammar, serializeGrammar } from '@repo/randomart-core/artwork/serialize';
import type { GrammarData } from '@repo/randomart-core/artwork/serialize';
import { catalog } from '@repo/randomart-core/catalog/default';
import { GENERATOR_VERSION } from '@repo/randomart-core/generator/generate';
import { sampleGrammars } from '@repo/randomart-core/grammar/sample';
import type { SampleOptions } from '@repo/randomart-core/grammar/types';
import { createSeed } from '@repo/randomart-core/random/seed';
import { createBatchRenderer } from '@repo/randomart-core/renderer/batch';

/**
 * Dataset page: the in-browser half of the offline dataset pipeline. It owns no rendering of its
 * own any more — the GPU work lives in `@repo/randomart-core/renderer/batch` (the same renderer the
 * bench uses). This file is only the wire adapter: a serialization boundary for `src/node/cli.ts`,
 * which drives it through `window.datasetApi`. Images are drawn at phase 0, one program at a time,
 * on the renderer's single reused surface.
 */
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
    readonly ok: readonly boolean[];
    readonly errors: readonly (string | null)[];
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
