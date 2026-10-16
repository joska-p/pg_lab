import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createGrammar, defaultGrammar } from '../grammar/index.ts';
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
        const grammar = defaultGrammar(catalog);
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
        const grammar = defaultGrammar(catalog);
        const restored = parseGrammarFile(catalog, serializeGrammarFile(grammar));

        expect(serializeGrammar(restored)).toEqual(serializeGrammar(grammar));
    });

    it('writes format, version, grammar in that order', () => {
        const text = serializeGrammarFile(defaultGrammar(catalog));

        expect(Object.keys(JSON.parse(text))).toEqual(['format', 'version', 'grammar']);
    });

    it('rejects wrong format, wrong version and invalid JSON', () => {
        const base = JSON.parse(serializeGrammarFile(defaultGrammar(catalog)));

        expect(() =>
            parseGrammarFile(catalog, JSON.stringify({ ...base, format: 'other' })),
        ).toThrow(/format "other" not supported/);
        expect(() => parseGrammarFile(catalog, JSON.stringify({ ...base, version: 2 }))).toThrow(
            /version 2 not supported/,
        );
        expect(() => parseGrammarFile(catalog, '{nope')).toThrow(/invalid JSON/);
    });

    it('rejects unknown top-level fields', () => {
        const base = JSON.parse(serializeGrammarFile(defaultGrammar(catalog)));

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
