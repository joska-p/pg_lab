import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createGrammar, defaultGrammar } from '../grammar/index.ts';
import { deserializeGrammar, serializeGrammar } from './serialize.ts';

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

    it('repairs broken constraints instead of refusing them (throw-vs-repair policy)', () => {
        const grammar = deserializeGrammar(catalog, {
            weights: { x: 1, add: 1 },
            constraints: { minDepth: 5, maxDepth: 3, maxNodes: 14 },
        });

        expect(serializeGrammar(grammar).constraints).toEqual({
            minDepth: 3,
            maxDepth: 3,
            maxNodes: 14,
        });
    });

    it('refuses corrupted weights instead of clamping them (throw-vs-repair policy)', () => {
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: Number.NaN },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 10 },
            }),
        ).toThrow('Randomart: weight of operator "x" must be a finite number, received NaN');

        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 101 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 10 },
            }),
        ).toThrow('Randomart: weight of operator "x" (101) must be within [0, 100]');
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
