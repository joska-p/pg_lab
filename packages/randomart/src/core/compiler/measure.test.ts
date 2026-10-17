import { describe, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { compile } from './compile.ts';
import { buildFuzzCases } from './testing.ts';
import type { SharingPolicy } from './types.ts';

/**
 * Not a test of behaviour: prints a comparison of the sharing policies on the fuzz cases. Opt-in,
 * so the normal run stays fast:
 *
 *     VITE_MEASURE=1 vp test measure
 */
const enabled = import.meta.env.VITE_MEASURE === '1';
const COUNT = Number(import.meta.env.VITE_FUZZ_COUNT ?? 300);
const POLICIES: readonly SharingPolicy[] = ['none', 'shared', 'all'];

function percentile(sorted: readonly number[], p: number): number {
    if (sorted.length === 0) {
        return 0;
    }

    return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

const mean = (values: readonly number[]): number =>
    values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

describe('sharing policy measurements', () => {
    it.skipIf(!enabled)('prints source size, variables and compile time per policy', () => {
        const catalog = createDefaultCatalog();
        const cases = buildFuzzCases(catalog, COUNT);
        const rows: Record<string, number | string>[] = [];

        for (const policy of POLICIES) {
            const lengths: number[] = [];
            const variables: number[] = [];
            const times: number[] = [];
            let overflow = 0;

            for (const { grammar, seed } of cases) {
                const expression = generate(catalog, grammar, seed);
                const start = performance.now();

                try {
                    const shader = compile(catalog, expression, {
                        sharing: policy,
                        color: grammar.color,
                    });

                    times.push(performance.now() - start);
                    lengths.push(shader.stats.sourceLength);
                    variables.push(shader.stats.variables);
                } catch {
                    overflow++;
                }
            }

            const sortedLengths = [...lengths].sort((a, b) => a - b);

            rows.push({
                policy,
                cases: lengths.length,
                overflow,
                meanLength: Math.round(mean(lengths)),
                p95Length: percentile(sortedLengths, 0.95),
                meanVariables: Number(mean(variables).toFixed(1)),
                meanCompileMs: Number(mean(times).toFixed(2)),
            });
        }

        console.table(rows);
    });
});
