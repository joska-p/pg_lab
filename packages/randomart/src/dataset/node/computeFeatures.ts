import { describeImage } from '../analysis/descriptors.ts';
import type { Dataset } from './loadDataset.ts';

/** One dataset grammar, summarized over its valid images. */
export interface FeatureRow {
    /** Index in the dataset: rows skip unusable grammars, this keeps the traceability. */
    readonly grammar: number;
    /** How many valid images the summary is made of. */
    readonly valid: number;
    readonly mean: readonly number[];
    readonly std: readonly number[];
}

/** The feature table: one column per descriptor, one row per usable grammar. */
export interface Features {
    readonly names: readonly string[];
    readonly rows: readonly FeatureRow[];
}

/** Below this many valid images a grammar is dropped: too few points for a spread. */
const MIN_VALID = 4;

/** Summarizes each grammar of `dataset` as the mean and spread of its image descriptors. */
export function computeFeatures(dataset: Dataset): Features {
    let names: string[] = [];
    const rows: FeatureRow[] = [];

    dataset.grammars.forEach((entry, grammar) => {
        const vectors: number[][] = [];

        entry.ok.forEach((ok, seed) => {
            if (ok) {
                const described = describeImage(dataset.image(grammar, seed));

                names = Object.keys(described);
                vectors.push(Object.values(described));
            }
        });

        // Too few valid images make the spread meaningless: skip, the index keeps the traceability.
        if (vectors.length < MIN_VALID) {
            return;
        }

        const columns = names.map((_, c) => vectors.map((v) => v[c]));
        const mean = columns.map((column) => column.reduce((s, x) => s + x, 0) / column.length);
        const std = columns.map((column, c) =>
            Math.sqrt(column.reduce((s, x) => s + (x - mean[c]) ** 2, 0) / column.length),
        );

        rows.push({ grammar, valid: vectors.length, mean, std });
    });

    return { names, rows };
}
