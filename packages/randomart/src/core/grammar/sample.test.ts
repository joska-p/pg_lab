import { describe, expect, it } from 'vite-plus/test';

import { serializeGrammar } from '../artwork/index.ts';
import { createDefaultCatalog } from '../catalog/index.ts';
import { DEFAULT_CHANNELS, RAW_CHANNELS } from '../color/index.ts';
import { generate } from '../generator/index.ts';
import { getVocabulary } from '../grammar/index.ts';
import { sampleGrammars } from './sample.ts';

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

    it('draws the still-image default (motion off) with the channel model raw', () => {
        for (const { grammar } of sampleGrammars(catalog, 100)) {
            expect(grammar.motion).toBe('off');
            expect(grammar.channels).toEqual(RAW_CHANNELS);
        }
    });

    it('honours a custom channel model (the bench passes the app default)', () => {
        for (const { grammar } of sampleGrammars(catalog, 20, { channels: DEFAULT_CHANNELS })) {
            expect(grammar.channels).toEqual(DEFAULT_CHANNELS);
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

    it('covers a wide range of vocabulary sizes', () => {
        const sizes = sampleGrammars(catalog, 200).map(
            (s) => getVocabulary(catalog, s.grammar.weights).length,
        );

        expect(Math.max(...sizes) - Math.min(...sizes)).toBeGreaterThanOrEqual(5);
    });

    it('derives distinct image seeds', () => {
        const [first] = sampleGrammars(catalog, 1, { seedsPerGrammar: 16 });

        expect(new Set(first.seeds).size).toBe(16);
    });
});
