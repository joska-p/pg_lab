import { compile } from '@repo/randomart-core/emit';
import { generate } from '@repo/randomart-core/generate';
import { getGrammarPreset } from '@repo/randomart-core/grammar';
import { createSeed } from '@repo/randomart-core/seed';
import { describe, expect, it } from 'vite-plus/test';

import { featuresOf } from './features';
import type { ExpressionFeatures } from './features';
import type { ImageStats } from './imageStats';
import { imageStats } from './imageStats';
import type { Renderer, RenderOutcome } from './render';
import { createRenderer } from './render';

const PRESETS = ['vivid', 'motion', 'muted'] as const;
type PresetId = (typeof PRESETS)[number];
const SEEDS_PER_PRESET = 6;
const SIZE = 96;

interface RenderResult {
    preset: string;
    seed: number;
    stats: ImageStats;
    features: ExpressionFeatures;
    animated: boolean;
}

async function renderPreset(
    renderer: Renderer,
    presetId: PresetId,
    seedIndex: number,
): Promise<RenderResult> {
    const preset = getGrammarPreset(presetId);
    const expression = generate(preset.grammar, createSeed(String(seedIndex)));
    const shader = compile(expression, { space: preset.grammar.space });
    const features = featuresOf(expression, preset.grammar.space);
    const phases = shader.animated ? [0, 1 / 3, 2 / 3] : [0];

    return renderer.render(shader.source, phases, SIZE).then((outcome: RenderOutcome) => {
        if (!outcome.ok) {
            throw new Error(
                `Preset ${presetId} seed ${seedIndex} failed: ${outcome.error.slice(0, 200)}`,
            );
        }
        const stats = imageStats(outcome.frames);
        return { preset: presetId, seed: seedIndex, stats, features, animated: shader.animated };
    });
}

describe('preset visual claim', () => {
    it('renders each new preset and reports its visual features', async () => {
        const renderer = await createRenderer();
        const results: RenderResult[] = [];

        try {
            for (const presetId of PRESETS) {
                for (let s = 0; s < SEEDS_PER_PRESET; s++) {
                    const r = await renderPreset(renderer, presetId, s);
                    results.push(r);
                    console.log(
                        `${r.preset.padEnd(8)} seed ${r.seed} ` +
                            `brightness=${r.stats.brightness.toFixed(3)} ` +
                            `contrast=${r.stats.contrast.toFixed(3)} ` +
                            `sharpness=${r.stats.sharpness.toFixed(3)} ` +
                            `busyness=${r.stats.busyness.toFixed(3)} ` +
                            `colorfulness=${r.stats.colorfulness.toFixed(3)} ` +
                            `motion=${r.stats.motion.toFixed(3)} ` +
                            `animated=${r.animated}`,
                    );
                }
            }
        } finally {
            await renderer.close();
        }

        // Vérifie que chaque preset a produit au moins un rendu
        for (const presetId of PRESETS) {
            const count = results.filter((r) => r.preset === presetId).length;
            expect(count).toBe(SEEDS_PER_PRESET);
        }

        // Moyennes par preset
        const byPreset = new Map<string, RenderResult[]>();
        for (const r of results) {
            const list = byPreset.get(r.preset) ?? [];
            list.push(r);
            byPreset.set(r.preset, list);
        }

        for (const [presetId, list] of byPreset) {
            const avg = (key: keyof ImageStats) =>
                list.reduce((s, r) => s + r.stats[key], 0) / list.length;
            console.log(
                `\n${presetId} (n=${list.length}): ` +
                    `brightness=${avg('brightness').toFixed(3)} ` +
                    `contrast=${avg('contrast').toFixed(3)} ` +
                    `sharpness=${avg('sharpness').toFixed(3)} ` +
                    `busyness=${avg('busyness').toFixed(3)} ` +
                    `colorfulness=${avg('colorfulness').toFixed(3)} ` +
                    `motion=${avg('motion').toFixed(3)}`,
            );
        }

        // Claims à vérifier (tendance, pas strict sur 6 échantillons)
        const vivid = byPreset.get('vivid');
        const motion = byPreset.get('motion');
        const muted = byPreset.get('muted');

        if (!vivid || !motion || !muted) {
            throw new Error('Tous les presets doivent être présents');
        }

        const avgColor = (list: RenderResult[]) =>
            list.reduce((s, r) => s + r.stats.colorfulness, 0) / list.length;
        const avgMotion = (list: RenderResult[]) =>
            list.reduce((s, r) => s + r.stats.motion, 0) / list.length;
        const avgContrast = (list: RenderResult[]) =>
            list.reduce((s, r) => s + r.stats.contrast, 0) / list.length;

        console.log(
            `\nClaim check: vivid.colorfulness=${avgColor(vivid).toFixed(3)} vs muted.colorfulness=${avgColor(muted).toFixed(3)}`,
        );
        console.log(
            `Claim check: motion.motion=${avgMotion(motion).toFixed(3)} vs muted.motion=${avgMotion(muted).toFixed(3)}`,
        );
        console.log(
            `Claim check: vivid.contrast=${avgContrast(vivid).toFixed(3)} vs muted.contrast=${avgContrast(muted).toFixed(3)}`,
        );
    });
});
