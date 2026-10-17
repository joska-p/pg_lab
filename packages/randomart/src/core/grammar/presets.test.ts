import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { createSeed } from '../random/index.ts';
import { createGrammar } from './grammar.ts';
import { grammarPresets, presetIdOf } from './presets.ts';

const catalog = createDefaultCatalog();
const presets = grammarPresets(catalog);

describe('grammarPresets', () => {
    it('has unique ids and labels', () => {
        expect(new Set(presets.map((preset) => preset.id)).size).toBe(presets.length);
        expect(new Set(presets.map((preset) => preset.label)).size).toBe(presets.length);
    });

    it('gives grammars the generator can use', () => {
        for (const preset of presets) {
            expect(() => generate(catalog, preset.grammar, createSeed(1))).not.toThrow();
        }
    });

    it('is recognized by presetIdOf', () => {
        for (const preset of presets) {
            expect(presetIdOf(presets, preset.grammar)).toBe(preset.id);
        }
    });

    it('reports an undefined id for a grammar that matches no preset', () => {
        const base = presets[0].grammar;
        const custom = createGrammar(catalog, {
            weights: { ...base.weights, x: 9 },
            constraints: base.constraints,
            channels: base.channels,
        });

        expect(presetIdOf(presets, custom)).toBeUndefined();
    });
});
