import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import { generate } from '../generator/generator';
import { createSeed } from '../random/seed';
import { createGrammar, constraintsOf } from './grammar';
import { defaultGrammar, grammarPresets, presetIdOf } from './presets';

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
            expect(preset.grammar.shareDepth).toBeLessThanOrEqual(
                constraintsOf(preset.grammar.size).maxDepth,
            );
        }
    });

    it('is recognized by presetIdOf', () => {
        for (const preset of presets) {
            expect(presetIdOf(catalog, presets, preset.grammar)).toBe(preset.id);
        }
    });

    it('includes the app default as the structure preset', () => {
        const structure = presets.find((preset) => preset.id === 'structure');

        expect(structure?.grammar).toEqual(defaultGrammar(catalog));
        expect(presetIdOf(catalog, presets, defaultGrammar(catalog))).toBe('structure');
    });

    it('encodes mono as the full medium trunk and raw RGB as no trunk', () => {
        const mono = presets.find((preset) => preset.id === 'mono');
        const rgb = presets.find((preset) => preset.id === 'rgb');

        expect(mono?.grammar.shareDepth).toBe(constraintsOf('medium').maxDepth);
        expect(rgb?.grammar.shareDepth).toBe(0);
        expect(rgb?.grammar.space).toBe('srgb');
    });

    it('reports an undefined id once a knob moved', () => {
        const base = presets[0].grammar;
        const moved = createGrammar(catalog, {
            weights: base.weights,
            size: 'large',
            shareDepth: base.shareDepth,
            space: base.space,
        });

        expect(presetIdOf(catalog, presets, moved)).toBeUndefined();
    });
});
