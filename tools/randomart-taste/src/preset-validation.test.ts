import { COLOR_SPACE_IDS } from '@repo/randomart-core/colors';
import { compile } from '@repo/randomart-core/emit';
import { generate } from '@repo/randomart-core/generate';
import { drawGrammar, getGrammarPreset, GRAMMAR_PRESETS } from '@repo/randomart-core/grammar';
import type { GrammarPresetId } from '@repo/randomart-core/grammar';
import { createRng } from '@repo/randomart-core/rng';
import { createSeed } from '@repo/randomart-core/seed';
import { describe, expect, it } from 'vite-plus/test';

import { imageStats } from './imageStats';
import type { ImageStats } from './imageStats';
import { createRenderer } from './render';

/** Presets appris (tous sauf 'default'). */
const LEARNED_PRESETS = GRAMMAR_PRESETS.filter((p) => p.id !== 'default');

const SEEDS_PER_PRESET = 64;
const RANDOM_COUNT = 64;
const SIZE = 96;
const RNG_SEED = 'validation';

interface RenderResult {
    preset: string;
    stats: ImageStats;
}

async function renderPreset(
    renderer: Awaited<ReturnType<typeof createRenderer>>,
    presetId: GrammarPresetId,
    seedIndex: number,
): Promise<RenderResult> {
    const preset = getGrammarPreset(presetId);
    const expression = generate(preset.grammar, createSeed(String(seedIndex)));
    const shader = compile(expression, { space: preset.space });
    const phases = shader.animated ? [0, 1 / 3, 2 / 3] : [0];

    const outcome = await renderer.render(shader.source, phases, SIZE);
    if (!outcome.ok) {
        throw new Error(
            `Preset ${presetId} seed ${seedIndex} failed: ${outcome.error.slice(0, 200)}`,
        );
    }

    return { preset: presetId, stats: imageStats(outcome.frames) };
}

async function renderRandom(
    renderer: Awaited<ReturnType<typeof createRenderer>>,
    index: number,
    rng: ReturnType<typeof createRng>,
): Promise<RenderResult> {
    const grammar = drawGrammar(rng);
    const space = rng.pick(COLOR_SPACE_IDS);
    const expression = generate(grammar, createSeed(String(index)));
    const shader = compile(expression, { space });
    const phases = shader.animated ? [0, 1 / 3, 2 / 3] : [0];

    const outcome = await renderer.render(shader.source, phases, SIZE);
    if (!outcome.ok) {
        throw new Error(`Random seed ${index} failed: ${outcome.error.slice(0, 200)}`);
    }

    return { preset: 'random', stats: imageStats(outcome.frames) };
}

type Axis = keyof ImageStats;

const TARGET_AXIS: Record<GrammarPresetId, Axis> = {
    brightness: 'brightness',
    contrast: 'contrast',
    sharpness: 'sharpness',
    busyness: 'busyness',
    colorfulness: 'colorfulness',
    motion: 'motion',
    default: 'brightness',
};

const mean = (list: RenderResult[], axis: Axis) =>
    list.reduce((s, r) => s + r.stats[axis], 0) / list.length;

describe('preset render validation', () => {
    it('renders 64 seeds per learned preset and compares to a random draw', async () => {
        const renderer = await createRenderer();
        const rng = createRng(createSeed(RNG_SEED));
        const results: RenderResult[] = [];

        try {
            // 64 seeds per learned preset
            for (const preset of LEARNED_PRESETS) {
                for (let s = 0; s < SEEDS_PER_PRESET; s++) {
                    results.push(await renderPreset(renderer, preset.id, s));
                }
            }

            // 64 random grammars
            for (let i = 0; i < RANDOM_COUNT; i++) {
                results.push(await renderRandom(renderer, i, rng));
            }
        } finally {
            await renderer.close();
        }

        // Group by preset
        const byPreset = new Map<string, RenderResult[]>();
        for (const r of results) {
            const list = byPreset.get(r.preset) ?? [];
            list.push(r);
            byPreset.set(r.preset, list);
        }

        // Sanity: every preset and random bucket filled
        for (const preset of LEARNED_PRESETS) {
            const list = byPreset.get(preset.id);
            expect(list?.length).toBe(SEEDS_PER_PRESET);
        }
        expect(byPreset.get('random')?.length).toBe(RANDOM_COUNT);

        const random = byPreset.get('random');
        expect(random).toBeDefined();

        console.log('\n=== Preset validation (n=64 per preset, random n=64) ===');
        console.log(
            `${'preset'.padEnd(14)} ${'axis'.padEnd(12)} ${'preset'.padEnd(10)} ${'random'.padEnd(10)} lift`,
        );

        let allPass = true;
        for (const preset of LEARNED_PRESETS) {
            const list = byPreset.get(preset.id);
            const randomList = byPreset.get('random');
            if (!list || !randomList) {
                throw new Error(`Missing results for ${preset.id} or random`);
            }

            const axis = TARGET_AXIS[preset.id];
            const presetMean = mean(list, axis);
            const randomMean = mean(randomList, axis);
            const lift = randomMean > 0 ? (presetMean - randomMean) / randomMean : 0;
            const pass = lift > 0;
            if (!pass) {
                allPass = false;
            }
            console.log(
                `${preset.id.padEnd(14)} ${axis.padEnd(12)} ${presetMean.toFixed(4).padEnd(10)} ${randomMean.toFixed(4).padEnd(10)} ${(lift * 100).toFixed(1)}% ${pass ? 'PASS' : 'FAIL'}`,
            );
        }

        console.log(
            `\n${allPass ? 'ALL PRESETS BEAT RANDOM on their target axis' : 'SOME PRESETS DO NOT BEAT RANDOM'}`,
        );
        expect(allPass).toBe(true);
    }, 300_000);
});
