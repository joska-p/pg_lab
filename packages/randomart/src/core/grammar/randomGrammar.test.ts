import { describe, expect, it } from 'vite-plus/test';

import { serializeGrammar } from '../artwork/index.ts';
import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import { weightOf } from './grammar.ts';
import { randomGrammar } from './randomGrammar.ts';

const catalog = createDefaultCatalog();
const rngAt = (seed: number) => createRng(createSeed(seed));

describe('randomGrammar', () => {
    it('is deterministic for a given rng seed', () => {
        const a = randomGrammar(catalog, rngAt(1));
        const b = randomGrammar(catalog, rngAt(1));

        expect(serializeGrammar(a)).toEqual(serializeGrammar(b));
    });

    it('produces distinct grammars across seeds', () => {
        const texts = new Set(
            Array.from({ length: 50 }, (_, i) =>
                JSON.stringify(serializeGrammar(randomGrammar(catalog, rngAt(i + 1)))),
            ),
        );

        expect(texts.size).toBeGreaterThan(40);
    });

    it('always yields a grammar the generator can use', () => {
        for (let i = 1; i <= 100; i++) {
            const grammar = randomGrammar(catalog, rngAt(i));

            expect(() => generate(catalog, grammar, createSeed(42))).not.toThrow();
        }
    });

    it('keeps time operators off when includeTime is false', () => {
        for (let i = 1; i <= 50; i++) {
            const grammar = randomGrammar(catalog, rngAt(i), { includeTime: false });

            expect(weightOf(grammar.weights, 'tsin')).toBe(0);
            expect(weightOf(grammar.weights, 'tcos')).toBe(0);
        }
    });

    it('may keep time operators when includeTime is true', () => {
        const on = Array.from({ length: 50 }, (_, i) =>
            randomGrammar(catalog, rngAt(i + 1), { includeTime: true }),
        ).filter(
            (grammar) =>
                weightOf(grammar.weights, 'tsin') > 0 || weightOf(grammar.weights, 'tcos') > 0,
        );

        expect(on.length).toBeGreaterThan(0);
    });
});
