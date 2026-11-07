import { describe, expect, it } from 'vite-plus/test';

import { learn, printResults } from './learn';

describe('learn', () => {
    it('régression opérateurs → features visuelles sur le dataset généré', () => {
        const results = learn({
            input: 'data/samples.json',
            output: 'data/coefficients.json',
            lambda: 0.01,
            topN: 12,
        });

        printResults(results, 12);

        expect(results).toHaveLength(6);
        for (const res of results) {
            console.log(`${res.target}: R² = ${res.r2.toFixed(3)}`);
            expect(res.r2).toBeGreaterThanOrEqual(0);
        }
    });
});
