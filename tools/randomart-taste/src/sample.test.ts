import { describe, expect, it } from 'vite-plus/test';

import { drawSamples } from './sample';

const OPTIONS = { grammars: 3, seedsPerGrammar: 2, rngSeed: 'test' };

describe('drawSamples', () => {
    it('draws grammars x seeds samples, grouped by grammar', () => {
        const samples = drawSamples(OPTIONS);

        expect(samples).toHaveLength(6);
        expect(samples.map((sample) => sample.id)).toEqual([0, 1, 2, 3, 4, 5]);
        expect(samples.map((sample) => sample.grammarId)).toEqual([0, 0, 1, 1, 2, 2]);
        expect(samples[0]?.grammar).toBe(samples[1]?.grammar);
    });

    it('replays the same dataset for the same rng seed', () => {
        const identity = (options: typeof OPTIONS) =>
            drawSamples(options).map((sample) => [sample.seed, sample.shader.source]);

        expect(identity(OPTIONS)).toEqual(identity(OPTIONS));
        expect(identity(OPTIONS)).not.toEqual(identity({ ...OPTIONS, rngSeed: 'other' }));
    });

    it('keeps features consistent with the compiled shader', () => {
        for (const sample of drawSamples(OPTIONS)) {
            expect(sample.features.animated).toBe(sample.shader.animated);
            expect(sample.features.space).toBe(sample.grammar.space);
        }
    });
});
