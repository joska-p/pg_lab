// Usage: node scripts/bench/features.ts dataset --out scripts/bench/features.json
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { describeImage } from '../../src/core/analysis/descriptors.ts';
import { loadDataset } from './dataset.ts';

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { out: { type: 'string', default: 'scripts/bench/features.json' } },
});

const dataset = loadDataset(positionals[0] ?? 'dataset');
const rows: { grammar: number; valid: number; mean: number[]; std: number[] }[] = [];
let names: string[] = [];

dataset.grammars.forEach((entry, g) => {
    const vectors: number[][] = [];

    entry.ok.forEach((ok, k) => {
        if (ok) {
            const described = describeImage(dataset.image(g, k));

            names = Object.keys(described);
            vectors.push(Object.values(described));
        }
    });

    // Too few valid images make the spread meaningless: skip, the index keeps the traceability.
    if (vectors.length < 4) {
        return;
    }

    const columns = names.map((_, c) => vectors.map((v) => v[c]));
    const avg = columns.map((col) => col.reduce((s, x) => s + x, 0) / col.length);
    const spread = columns.map((col, c) =>
        Math.sqrt(col.reduce((s, x) => s + (x - avg[c]) ** 2, 0) / col.length),
    );

    rows.push({ grammar: g, valid: vectors.length, mean: avg, std: spread });
});

writeFileSync(values.out, `${JSON.stringify({ names, rows }, null, 2)}\n`);
console.log(
    `${values.out}: ${rows.length}/${dataset.grammars.length} grammars, ${names.length} descriptors`,
);
