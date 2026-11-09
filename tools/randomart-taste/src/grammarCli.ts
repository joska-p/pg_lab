import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { ALL_GROUPS, learnGrammarLevel } from './grammarLevel';
import type { FeatureGroup, GrammarLevelResult, GrammarSampleRow } from './grammarLevel';

const { values } = parseArgs({
    options: {
        input: { type: 'string' },
        output: { type: 'string' },
        lambda: { type: 'string' },
        folds: { type: 'string' },
        top: { type: 'string' },
    },
});

const input = values.input ?? 'data/samples.json';
const output = values.output ?? 'data/grammar-level.json';
const lambda = Number(values.lambda ?? '0.01');
const folds = Number(values.folds ?? '5');
const top = Number(values.top ?? '8');

function isRows(value: unknown): value is { rows: GrammarSampleRow[] } {
    return (
        typeof value === 'object' && value !== null && 'rows' in value && Array.isArray(value.rows)
    );
}

const raw: unknown = JSON.parse(readFileSync(input, 'utf8'));

if (!isRows(raw)) {
    throw new Error(`Invalid dataset: ${input}`);
}

const full = learnGrammarLevel(raw.rows, { lambda, folds });

const ABLATIONS: readonly { label: string; groups: readonly FeatureGroup[] }[] = [
    { label: 'weights only', groups: ['weights'] },
    { label: 'structure only', groups: ['structure'] },
    { label: 'space only', groups: ['space'] },
    { label: 'structure + space', groups: ['structure', 'space'] },
    { label: 'all', groups: ALL_GROUPS },
];

console.log('\nHeld-out R² (cvR2) by feature group');
console.log(['group'.padEnd(20), ...full.map((r) => r.target.slice(0, 7).padStart(8))].join(' '));

const ablations = ABLATIONS.map(({ label, groups }) => ({
    label,
    results: label === 'all' ? full : learnGrammarLevel(raw.rows, { lambda, folds, groups }),
}));

for (const { label, results } of ablations) {
    console.log([label.padEnd(20), ...results.map((r) => r.cvR2.toFixed(3).padStart(8))].join(' '));
}

function printTop(result: GrammarLevelResult | undefined): void {
    if (result === undefined) {
        return;
    }

    console.log(`\nTop effects on ${result.target} (change per 1 std of the feature)`);

    const entries = Object.entries(result.effect)
        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
        .slice(0, top);

    for (const [name, effect] of entries) {
        console.log(`  ${name.padEnd(18)} ${effect >= 0 ? '+' : ''}${effect.toFixed(4)}`);
    }
}

printTop(full.find((r) => r.target === 'brightness'));
printTop(full.find((r) => r.target === 'colorfulness'));

writeFileSync(
    output,
    JSON.stringify(
        {
            lambda,
            folds,
            full,
            ablations: ablations.map(({ label, results }) => ({
                label,
                cvR2: Object.fromEntries(results.map((r) => [r.target, r.cvR2])),
            })),
        },
        null,
        2,
    ),
);
console.log(`\nWrote ${output}`);
