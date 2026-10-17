import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { RgbImage } from './descriptors.ts';

export interface DatasetGrammar {
    readonly grammar: unknown;
    readonly seeds: readonly number[];
    /** False when the image could not be rendered (its pixels are all zeros). */
    readonly ok: readonly boolean[];
}

export interface Dataset {
    readonly size: number;
    readonly seedsPerGrammar: number;
    readonly generatorVersion: number;
    readonly grammars: readonly DatasetGrammar[];
    image(grammarIndex: number, seedIndex: number): RgbImage;
}

/** Reads `dataset.json` + `pixels.bin` as written by randomart's `generate-dataset.mjs`. */
export function loadDataset(directory: string): Dataset {
    const meta = JSON.parse(readFileSync(join(directory, 'dataset.json'), 'utf8'));
    const pixels = readFileSync(join(directory, 'pixels.bin'));

    if (meta.format !== 'randomart-dataset' || meta.version !== 1) {
        throw new Error(`Unsupported dataset: ${String(meta.format)} v${String(meta.version)}`);
    }

    const { size, seedsPerGrammar, grammars } = meta as {
        size: number;
        seedsPerGrammar: number;
        grammars: DatasetGrammar[];
    };
    const imageBytes = size * size * 3;
    const expected = grammars.length * seedsPerGrammar * imageBytes;

    if (pixels.length !== expected) {
        throw new Error(`pixels.bin is ${pixels.length} bytes, expected ${expected}`);
    }

    return {
        size,
        seedsPerGrammar,
        generatorVersion: meta.generatorVersion,
        grammars,
        image(grammarIndex, seedIndex) {
            const start = (grammarIndex * seedsPerGrammar + seedIndex) * imageBytes;

            return {
                width: size,
                height: size,
                rgb: new Uint8Array(pixels.buffer, pixels.byteOffset + start, imageBytes),
            };
        },
    };
}
