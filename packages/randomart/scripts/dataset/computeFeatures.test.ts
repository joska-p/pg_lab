import { describe, expect, it } from 'vite-plus/test';

import { computeFeatures } from './computeFeatures.ts';
import { fakeDataset } from './testing.ts';

describe('computeFeatures', () => {
    it('summarizes each grammar as descriptor mean and spread', () => {
        const dataset = fakeDataset({ count: 3, seeds: 5 });
        const features = computeFeatures(dataset);

        expect(features.rows.map((row) => row.grammar)).toEqual([0, 1, 2]);
        expect(features.rows[0].valid).toBe(5);
        expect(features.rows[0].mean).toHaveLength(features.names.length);
        expect(features.rows[0].std).toHaveLength(features.names.length);
    });

    it('describes different grammars differently', () => {
        const features = computeFeatures(fakeDataset({ count: 2, seeds: 5 }));

        expect(features.rows[0].mean).not.toEqual(features.rows[1].mean);
    });

    it('drops grammars with too few valid images', () => {
        const dataset = fakeDataset({ count: 2, seeds: 5 });
        const [first, second] = dataset.grammars;

        const features = computeFeatures({
            ...dataset,
            grammars: [first, { ...second, ok: [true, true, true, false, false] }],
        });

        expect(features.rows.map((row) => row.grammar)).toEqual([0]);
    });
});
