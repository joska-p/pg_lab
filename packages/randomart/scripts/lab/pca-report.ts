// Usage: node scripts/lab/pca-report.ts dataset scripts/lab/features.json [--only structure|color] [--std]
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { correlation, pca } from '../../src/lab/pca.ts';
import { loadDataset } from './dataset.ts';

const COLOR = new Set([
    'meanSaturation',
    'stdSaturation',
    'hueConcentration',
    'channelCorrelation',
    'colorfulness',
]);
const COMPONENTS_SHOWN = 4;

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        only: { type: 'string' },
        std: { type: 'boolean', default: false },
        out: { type: 'string', default: 'scripts/lab/pca.json' },
    },
});

const dataset = loadDataset(positionals[0] ?? 'dataset');
const features = JSON.parse(
    readFileSync(positionals[1] ?? 'scripts/lab/features.json', 'utf8'),
) as {
    names: string[];
    rows: { grammar: number; mean: number[]; std: number[] }[];
};

// Columns: descriptor means (and spreads with --std), filtered by --only, constants dropped.
const candidates = features.names.flatMap((name, j) => {
    const kept = values.only === undefined || (values.only === 'color') === COLOR.has(name);
    const columns = [{ label: name, pick: (row: (typeof features.rows)[number]) => row.mean[j] }];

    if (values.std) {
        columns.push({ label: `${name}.std`, pick: (row) => row.std[j] });
    }

    return kept ? columns : [];
});
const columns = candidates.filter(({ pick }) => new Set(features.rows.map(pick)).size > 1);
const matrix = features.rows.map((row) => columns.map(({ pick }) => pick(row)));
const result = pca(matrix);

// What each grammar was made of: operator weights, constraints, vocabulary size.
type Data = { weights: Record<string, number>; constraints: Record<string, number> };
const inputs = features.rows.map((row) => dataset.grammars[row.grammar].grammar as Data);
const operators = [...new Set(inputs.flatMap((g) => Object.keys(g.weights)))].sort();
const parameters = [
    ...operators.map((name) => ({ label: `w:${name}`, pick: (g: Data) => g.weights[name] ?? 0 })),
    ...['minDepth', 'maxDepth', 'maxNodes'].map((key) => ({
        label: key,
        pick: (g: Data) => g.constraints[key],
    })),
    {
        label: 'vocabulary',
        pick: (g: Data) => Object.values(g.weights).filter((w) => w > 0).length,
    },
];

const signed = (x: number): string => (x >= 0 ? '+' : '') + x.toFixed(2);
let cumulative = 0;

console.log(`${features.rows.length} grammars × ${columns.length} columns`);

for (let k = 0; k < Math.min(COMPONENTS_SHOWN, columns.length); k++) {
    cumulative += result.explained[k];

    const loadings = columns
        .map(({ label }, j) => ({ label, value: result.components[k][j] }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 6);
    const scores = result.scores.map((row) => row[k]);
    const links = parameters
        .map(({ label, pick }) => ({ label, r: correlation(scores, inputs.map(pick)) }))
        .filter(({ r }) => r !== 0)
        .sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
        .slice(0, 6);
    const order = scores.map((_, i) => i).sort((a, b) => scores[a] - scores[b]);
    const grammarsAt = (indices: number[]) =>
        indices.map((i) => features.rows[i].grammar).join(', ');

    console.log(
        `\nPC${k + 1}  ${(result.explained[k] * 100).toFixed(1)}%  (cumulative ${(cumulative * 100).toFixed(1)}%)`,
    );
    console.log(`  measures : ${loadings.map((l) => `${l.label} ${signed(l.value)}`).join('  ')}`);
    console.log(`  weights  : ${links.map((l) => `${l.label} ${signed(l.r)}`).join('  ')}`);
    console.log(`  low end  : grammars ${grammarsAt(order.slice(0, 4))}`);
    console.log(`  high end : grammars ${grammarsAt(order.slice(-4).reverse())}`);
}

writeFileSync(
    values.out,
    `${JSON.stringify(
        {
            columns: columns.map((c) => c.label),
            explained: result.explained,
            grammars: features.rows.map((row, i) => ({
                grammar: row.grammar,
                scores: result.scores[i].slice(0, 6),
            })),
        },
        null,
        2,
    )}\n`,
);
