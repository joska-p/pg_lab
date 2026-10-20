import type { Dataset } from './loadDataset';

/** A grid of dataset images: one row per grammar, one column per seed. */
export interface ContactSheet {
    readonly rgb: Uint8Array;
    readonly width: number;
    readonly height: number;
    /** Dataset grammar per row, in row order. */
    readonly indices: readonly number[];
}

/** Which grammars appear on the sheet, and in which order. */
export interface SheetSelection {
    /** Explicit grammar indices; wins over `start`/`rows`. */
    readonly grammars?: readonly number[];
    readonly start?: number;
    /** How many rows after `start`; defaults to the whole dataset. */
    readonly rows?: number;
}

/** Lays out one row of seeds per selected grammar, left to right, top to bottom. */
export function buildContactSheet(dataset: Dataset, selection: SheetSelection): ContactSheet {
    const { size, seedsPerGrammar } = dataset;
    const start = selection.start ?? 0;
    const wanted = selection.rows ?? dataset.grammars.length;
    const indices =
        selection.grammars ??
        Array.from(
            { length: Math.max(0, Math.min(wanted, dataset.grammars.length - start)) },
            (_, i) => start + i,
        );

    if (indices.length === 0) {
        throw new Error('Contact sheet: no grammar to draw');
    }

    const width = seedsPerGrammar * size;
    const height = indices.length * size;
    const rgb = new Uint8Array(width * height * 3);

    indices.forEach((grammarIndex, row) => {
        for (let col = 0; col < seedsPerGrammar; col++) {
            const { rgb: image } = dataset.image(grammarIndex, col);

            for (let y = 0; y < size; y++) {
                const from = y * size * 3;
                const to = ((row * size + y) * width + col * size) * 3;

                rgb.set(image.subarray(from, from + size * 3), to);
            }
        }
    });

    return { rgb, width, height, indices };
}
