import { describe, expect, it } from 'vite-plus/test';

import { CONFIG } from './index.ts';

/**
 * A seed only reproduces an image with the same grammar AND the same draw-affecting values. These
 * pins are the tripwire: when a test here fails, the change is legitimate only together with its
 * consequence — see `CONFIG`'s doc for the split.
 */
describe('config pins', () => {
    it('pins the draw-affecting knobs: changing them alters every seed (bump GENERATOR_VERSION)', () => {
        expect(CONFIG.terminals).toEqual({
            amp: { min: 0, max: 0.7 },
            phase: { min: -1, max: 1 },
            cycles: { min: 0, max: 1 },
            cycleCounts: { min: 1, max: 3 },
        });
        expect(CONFIG.generator).toEqual({
            paramDecimals: 3,
        });
    });

    it('pins the sampler knobs: changing them alters the explored recipes and seeds', () => {
        expect(CONFIG.recipe).toEqual({
            levels: {
                off: { weight: 0, odds: 3, allowsAnchors: false },
                low: { weight: 0.5, odds: 2, allowsAnchors: true },
                normal: { weight: 1, odds: 3, allowsAnchors: true },
                high: { weight: 3, odds: 2, allowsAnchors: true },
            },
            minActiveFamilies: 2,
            sizeProfiles: {
                small: { minDepth: 2, maxDepth: 5, maxNodes: 30 },
                medium: { minDepth: 3, maxDepth: 8, maxNodes: 60 },
                large: { minDepth: 4, maxDepth: 10, maxNodes: 120 },
            },
        });
        expect(CONFIG.sampling).toEqual({
            baseSeed: 1,
            exploreSpread: 4,
            drawSpread: 8,
            changeRate: 0.3,
            benchSeedsPerGrammar: 36,
            datasetSeedsPerGrammar: 16,
        });
    });

    it('pins the render/shell values: no expression changes, but the default image does', () => {
        expect(CONFIG.artwork).toEqual({
            width: 1_024,
            height: 1_024,
            loopMs: 60_000,
        });
        expect(CONFIG.color).toEqual({
            oklabChroma: 0.4,
        });
        expect(CONFIG.channels).toEqual({
            space: 'oklch',
            shareDepth: 2,
        });
        expect(CONFIG.app).toEqual({
            historyLimit: 30,
            initialSeed: 42,
        });
    });
});
