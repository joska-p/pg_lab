import { describe, expect, it } from 'vite-plus/test';

import { imageStats } from './imageStats';
import { createRenderer } from './render';
import { drawSamples } from './sample';

describe('e2e render smoke', () => {
    it('renders a small dataset end to end', async () => {
        const samples = drawSamples({
            grammars: 3,
            seedsPerGrammar: 2,
            rngSeed: 'e2e',
        });

        const renderer = await createRenderer();
        let rendered = 0;
        let skipped = 0;

        try {
            for (const sample of samples) {
                const phases = sample.shader.animated ? [0, 1 / 3, 2 / 3] : [0];
                const outcome = await renderer.render(sample.shader.source, phases, 64);

                if (outcome.ok) {
                    rendered++;
                    const stats = imageStats(outcome.frames);
                    expect(stats.brightness).toBeGreaterThanOrEqual(0);
                    expect(stats.brightness).toBeLessThanOrEqual(1);
                } else {
                    skipped++;
                    console.warn(`skipped ${sample.id}: ${outcome.error.slice(0, 120)}`);
                }
            }
        } finally {
            await renderer.close();
        }

        console.log(`e2e: rendered=${rendered} skipped=${skipped} total=${samples.length}`);
        expect(rendered + skipped).toBe(samples.length);
        expect(rendered).toBeGreaterThan(0);
    });
});
