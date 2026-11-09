import { describe, expect, it } from 'vite-plus/test';

import samples from '../data/samples.json';
import type { GrammarSampleRow, Target } from './grammarLevel';
import { learnGrammarLevel, TARGETS } from './grammarLevel';

interface SamplesJson {
    readonly rows: unknown[];
}

function isGrammarSampleRow(value: unknown): value is GrammarSampleRow {
    return (
        typeof value === 'object' &&
        value !== null &&
        'grammarId' in value &&
        'grammar' in value &&
        'space' in value &&
        'stats' in value
    );
}

const json = samples as SamplesJson;
if (!Array.isArray(json.rows)) {
    throw new Error('samples.json: rows is not an array');
}

const rows = json.rows.filter(isGrammarSampleRow);

function cvR2(
    results: readonly { readonly target: Target; readonly cvR2: number }[],
    target: Target,
): number {
    const found = results.find((r) => r.target === target);
    return found?.cvR2 ?? 0;
}

describe('grammar level: space-neutralized regression', () => {
    it('compares cvR2 with and without the space feature group', () => {
        // Full model: weights + structure + space
        const full = learnGrammarLevel(rows);

        // Space-neutralized: weights + structure only (space removed)
        const neutralized = learnGrammarLevel(rows, { groups: ['weights', 'structure'] });

        console.log('\n=== Space-neutralized regression (cvR2) ===');
        console.log(`${'target'.padEnd(14)} ${'full'.padEnd(10)} ${'neutralized'.padEnd(14)} drop`);

        let brightnessDrop = 0;
        let colorfulnessDrop = 0;

        for (const target of TARGETS) {
            const fullR2 = cvR2(full, target);
            const neuR2 = cvR2(neutralized, target);
            const drop = fullR2 - neuR2;
            console.log(
                `${target.padEnd(14)} ${fullR2.toFixed(3).padEnd(10)} ${neuR2.toFixed(3).padEnd(14)} ${(drop * 100).toFixed(1)} pt`,
            );

            if (target === 'brightness') {
                brightnessDrop = drop;
            }
            if (target === 'colorfulness') {
                colorfulnessDrop = drop;
            }
        }

        // brightness and colorfulness are space-dominated: removing space should hurt a lot
        expect(brightnessDrop).toBeGreaterThan(0.2);
        expect(colorfulnessDrop).toBeGreaterThan(0.2);

        // contrast, motion, busyness, sharpness are weight/structure-dominated: removing space should hurt less
        for (const target of ['contrast', 'motion', 'busyness', 'sharpness'] as const) {
            const fullR2 = cvR2(full, target);
            const neuR2 = cvR2(neutralized, target);
            const drop = fullR2 - neuR2;
            expect(drop).toBeLessThan(0.2);
        }
    });
});
