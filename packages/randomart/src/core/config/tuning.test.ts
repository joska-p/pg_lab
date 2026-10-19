import { describe, expect, it } from 'vite-plus/test';

import { TUNING } from './index.ts';

/**
 * A seed only reproduces an image with the same grammar AND the same draw-affecting values. These
 * pins are the tripwire: when a test here fails, the change is legitimate only together with its
 * consequence — see `TUNING`'s doc for the split.
 */
describe('tuning pins', () => {
    it('pins the draw-affecting knobs: changing them alters every seed (bump GENERATOR_VERSION)', () => {
        expect(TUNING.terminals).toEqual({
            amp: { min: 0, max: 0.7 },
            phase: { min: -1, max: 1 },
            cycles: { min: 0, max: 1 },
            cycleCounts: { min: 1, max: 3 },
        });
    });

    it('pins the sampler knobs: changing them alters the explored recipes and seeds', () => {
        expect(TUNING.recipe).toEqual({
            levels: {
                off: { weight: 0, odds: 3, anchor: false },
                low: { weight: 0.5, odds: 2, anchor: false },
                normal: { weight: 1, odds: 3, anchor: true },
                high: { weight: 3, odds: 2, anchor: true },
            },
            minActiveFamilies: 2,
            sizeProfiles: {
                small: { minDepth: 2, maxDepth: 5, maxNodes: 30 },
                medium: { minDepth: 3, maxDepth: 8, maxNodes: 60 },
                large: { minDepth: 4, maxDepth: 10, maxNodes: 120 },
            },
        });
    });
});
