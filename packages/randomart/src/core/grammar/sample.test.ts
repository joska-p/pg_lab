import { describe, expect, it } from 'vite-plus/test';

import { serializeGrammar } from '../artwork/serialize';
import { createDefaultCatalog } from '../catalog/Catalog';
import { generate } from '../generator/generator';
import { constraintsOf, getVocabulary } from './grammar';
import { sampleGrammars } from './sample';

const catalog = createDefaultCatalog();

describe('sampleGrammars', () => {
    it('is deterministic for a given base seed', () => {
        const a = sampleGrammars(catalog, 20, { baseSeed: 7 });
        const b = sampleGrammars(catalog, 20, { baseSeed: 7 });

        expect(a.map((s) => serializeGrammar(s.grammar))).toEqual(
            b.map((s) => serializeGrammar(s.grammar)),
        );
        expect(a.map((s) => s.seeds)).toEqual(b.map((s) => s.seeds));
    });

    it('draws every axis inside its bounds', () => {
        for (const { grammar } of sampleGrammars(catalog, 100)) {
            expect(grammar.shareDepth).toBeGreaterThanOrEqual(0);
            expect(grammar.shareDepth).toBeLessThanOrEqual(constraintsOf(grammar.size).maxDepth);
        }
    });

    it('covers more than one size and color space over a sample', () => {
        const sampled = sampleGrammars(catalog, 100);

        expect(new Set(sampled.map((s) => s.grammar.size)).size).toBeGreaterThan(1);
        expect(new Set(sampled.map((s) => s.grammar.space)).size).toBeGreaterThan(1);
    });

    it('honours pinned axes', () => {
        for (const { grammar } of sampleGrammars(catalog, 30, {
            size: 'small',
            shareDepth: 2,
            space: 'oklab',
        })) {
            expect(grammar.size).toBe('small');
            expect(grammar.shareDepth).toBe(2);
            expect(grammar.space).toBe('oklab');
        }
    });

    it('produces distinct grammars that the generator can always use', () => {
        const sampled = sampleGrammars(catalog, 100);
        const texts = new Set(sampled.map((s) => JSON.stringify(serializeGrammar(s.grammar))));

        expect(texts.size).toBe(100);

        for (const { grammar, seeds } of sampled) {
            for (const seed of seeds.slice(0, 2)) {
                expect(() => generate(catalog, grammar, seed)).not.toThrow();
            }
        }
    });

    it('covers a range of vocabulary sizes', () => {
        const sizes = sampleGrammars(catalog, 200).map(
            (s) => getVocabulary(catalog, s.grammar.weights).length,
        );

        expect(Math.max(...sizes) - Math.min(...sizes)).toBeGreaterThanOrEqual(3);
    });

    it('derives distinct image seeds', () => {
        const [first] = sampleGrammars(catalog, 1, { seedsPerGrammar: 16 });

        expect(new Set(first?.seeds).size).toBe(16);
    });
});
