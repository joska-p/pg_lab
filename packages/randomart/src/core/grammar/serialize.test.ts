import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { describeGrammar } from './describe.ts';
import { animatedGrammar, createGrammar, staticGrammar } from './grammar.ts';
import {
    deserializeGrammar,
    MAX_GRAMMAR_FILE_LENGTH,
    parseGrammarFile,
    serializeGrammar,
    serializeGrammarFile,
} from './serialize.ts';

const catalog = createDefaultCatalog();

describe('grammar serialization', () => {
    it('round-trips a grammar', () => {
        const grammar = animatedGrammar(catalog);
        const restored = deserializeGrammar(catalog, serializeGrammar(grammar));

        expect(serializeGrammar(restored)).toEqual(serializeGrammar(grammar));
    });

    it('writes weight keys in alphabetical order', () => {
        const grammar = createGrammar(catalog, {
            weights: { y: 1, x: 2, const: 1 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
        });

        expect(Object.keys(serializeGrammar(grammar).weights)).toEqual(['const', 'x', 'y']);
    });

    it('rejects wrong shapes with the field path', () => {
        expect(() => deserializeGrammar(catalog, 42)).toThrow(/grammar: object expected/);
        expect(() => deserializeGrammar(catalog, { weights: { x: 'a' }, constraints: {} })).toThrow(
            /grammar\.weights\.x: number expected/,
        );
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 4 },
            }),
        ).toThrow(/grammar\.constraints\.maxNodes: number expected/);
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 10 },
                extra: true,
            }),
        ).toThrow(/grammar\.extra: unknown field/);
    });

    it('relays createGrammar errors (unknown operator)', () => {
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1, nope: 1 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 10 },
            }),
        ).toThrow(/does not exist in catalog/);
    });
});

describe('grammar file', () => {
    it('round-trips through text', () => {
        const grammar = staticGrammar(catalog);
        const restored = parseGrammarFile(catalog, serializeGrammarFile(grammar));

        expect(serializeGrammar(restored)).toEqual(serializeGrammar(grammar));
    });

    it('writes format, version, grammar in that order', () => {
        const text = serializeGrammarFile(staticGrammar(catalog));

        expect(Object.keys(JSON.parse(text))).toEqual(['format', 'version', 'grammar']);
    });

    it('rejects wrong format, wrong version and invalid JSON', () => {
        const base = JSON.parse(serializeGrammarFile(staticGrammar(catalog)));

        expect(() =>
            parseGrammarFile(catalog, JSON.stringify({ ...base, format: 'other' })),
        ).toThrow(/format "other" not supported/);
        expect(() => parseGrammarFile(catalog, JSON.stringify({ ...base, version: 2 }))).toThrow(
            /version 2 not supported/,
        );
        expect(() => parseGrammarFile(catalog, '{nope')).toThrow(/invalid JSON/);
    });

    it('rejects unknown top-level fields', () => {
        const base = JSON.parse(serializeGrammarFile(staticGrammar(catalog)));

        expect(() => parseGrammarFile(catalog, JSON.stringify({ ...base, extra: 1 }))).toThrow(
            /file\.extra: unknown field/,
        );
    });

    it('rejects an oversized text before parsing it', () => {
        expect(() => parseGrammarFile(catalog, 'x'.repeat(MAX_GRAMMAR_FILE_LENGTH + 1))).toThrow(
            /too large/,
        );
    });
});

describe('describeGrammar', () => {
    it('detects time terminals', () => {
        expect(describeGrammar(catalog, staticGrammar(catalog)).hasTime).toBe(false);
        expect(describeGrammar(catalog, animatedGrammar(catalog)).hasTime).toBe(true);
    });

    it('reports zero growth for a terminal-only grammar', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1, y: 1 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 10 },
        });
        const summary = describeGrammar(catalog, grammar);

        expect(summary.operators).toBe(2);
        expect(summary.terminalShare).toBe(1);
        expect(summary.meanArity).toBe(0);
        expect(summary.growth).toBe(0);
    });

    it('computes share and mean arity on a small grammar', () => {
        // terminals: x(1) = 1 ; non-terminals: neg(arity 1, w 1), add(arity 2, w 2) → total 4
        const grammar = createGrammar(catalog, {
            weights: { x: 1, neg: 1, add: 2 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
        });
        const summary = describeGrammar(catalog, grammar);

        expect(summary.terminalShare).toBeCloseTo(0.25);
        expect(summary.meanArity).toBeCloseTo((1 * 1 + 2 * 2) / 3);
        expect(summary.growth).toBeCloseTo(0.75 * ((1 + 4) / 3));
    });
});
