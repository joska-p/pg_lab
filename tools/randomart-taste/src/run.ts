import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';

import { GENERATOR_VERSION } from '@repo/randomart-core/generate';

import { flattenFeatures } from './flatten';
import { imageStats } from './imageStats';
import type { ImageStats } from './imageStats';
import { createRenderer } from './render';
import { drawSamples } from './sample';
import type { Sample } from './sample';

/** Phases rendered for an animated shader; a still shader is rendered once. */
const ANIMATED_PHASES = [0, 1 / 3, 2 / 3] as const;
const STILL_PHASES = [0] as const;
const PROGRESS_EVERY = 100;

interface Row {
    readonly id: number;
    readonly grammarId: number;
    readonly seed: string;
    readonly grammar: Sample['grammar'];
    readonly space: Sample['space'];
    readonly features: Record<string, number>;
    readonly stats: ImageStats;
}

const { values } = parseArgs({
    options: {
        grammars: { type: 'string' },
        seeds: { type: 'string' },
        size: { type: 'string' },
        'rng-seed': { type: 'string' },
        out: { type: 'string' },
    },
});

const grammars = Number(values.grammars ?? '300');
const seedsPerGrammar = Number(values.seeds ?? '8');
const size = Number(values.size ?? '128');
const rngSeed = values['rng-seed'] ?? 'taste';
const out = values.out ?? 'data/samples.json';

async function main(): Promise<void> {
    const samples = drawSamples({ grammars, seedsPerGrammar, rngSeed });
    const renderer = await createRenderer();
    const rows: Row[] = [];
    let failures = 0;

    console.log(`Rendering ${samples.length} images at ${size}px...`);

    try {
        for (const sample of samples) {
            const phases = sample.shader.animated ? ANIMATED_PHASES : STILL_PHASES;
            const outcome = await renderer.render(sample.shader.source, phases, size);

            if (outcome.ok) {
                rows.push({
                    id: sample.id,
                    grammarId: sample.grammarId,
                    seed: sample.seed,
                    grammar: sample.grammar,
                    space: sample.space,
                    features: flattenFeatures(sample.features),
                    stats: imageStats(outcome.frames),
                });
            } else {
                failures++;
                console.warn(`Sample ${sample.id} skipped: ${outcome.error.slice(0, 200)}`);
            }

            if ((sample.id + 1) % PROGRESS_EVERY === 0) {
                console.log(`  ${sample.id + 1}/${samples.length}`);
            }
        }
    } finally {
        await renderer.close();
    }

    const dataset = {
        meta: { generatorVersion: GENERATOR_VERSION, size, rngSeed, grammars, seedsPerGrammar },
        rows,
    };

    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, JSON.stringify(dataset));
    console.log(`Wrote ${rows.length} rows to ${out} (${failures} skipped).`);
}

await main();
