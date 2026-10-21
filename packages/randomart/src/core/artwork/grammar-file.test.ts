import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import { createGrammar } from '../grammar/grammar';
import { grammarPresets } from '../grammar/presets';
import { deserializeGrammar, serializeGrammar } from './serialize';

const catalog = createDefaultCatalog();

describe('grammar serialization', () => {
    it('round-trips a grammar', () => {
        const grammar = grammarPresets(catalog)[0].grammar;
        const restored = deserializeGrammar(catalog, serializeGrammar(grammar));

        expect(serializeGrammar(restored)).toEqual(serializeGrammar(grammar));
    });

    it('writes weight keys in alphabetical order and carries the axes', () => {
        const grammar = createGrammar(catalog, {
            weights: { y: 1, x: 2, const: 1, add: 1 },
            size: 'small',
            shareDepth: 2,
            space: 'oklab',
        });
        const data = serializeGrammar(grammar);

        expect(Object.keys(data.weights)).toEqual(['add', 'const', 'x', 'y']);
        expect(data.size).toBe('small');
        expect(data.shareDepth).toBe(2);
        expect(data.space).toBe('oklab');
    });

    it('rejects wrong shapes with the field path', () => {
        expect(() => deserializeGrammar(catalog, 42)).toThrow(/grammar: object expected/);
        expect(() => deserializeGrammar(catalog, { weights: { x: 'a' } })).toThrow(
            /grammar\.weights\.x: number expected/,
        );
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1, add: 1 },
                size: 'medium',
                shareDepth: 2,
            }),
        ).toThrow(/grammar\.space: unknown color space/);
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1, add: 1 },
                size: 'nope',
                shareDepth: 2,
                space: 'oklch',
            }),
        ).toThrow(/grammar\.size: unknown size profile/);
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1, add: 1 },
                size: 'medium',
                shareDepth: 'a',
                space: 'oklch',
            }),
        ).toThrow(/grammar\.shareDepth: number expected/);
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1, add: 1 },
                size: 'medium',
                shareDepth: 2,
                space: 'oklch',
                extra: true,
            }),
        ).toThrow(/grammar\.extra: unknown field/);
    });

    it('refuses the removed constraints/channels fields', () => {
        const base = { weights: { x: 1, add: 1 }, size: 'medium', shareDepth: 2, space: 'oklch' };

        expect(() =>
            deserializeGrammar(catalog, {
                ...base,
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow(/grammar\.constraints: unknown field/);
        expect(() =>
            deserializeGrammar(catalog, {
                ...base,
                channels: { space: 'oklch', shareDepth: 2 },
            }),
        ).toThrow(/grammar\.channels: unknown field/);
    });

    it('repairs shareDepth against the size profile instead of refusing it', () => {
        const grammar = deserializeGrammar(catalog, {
            weights: { x: 1, add: 1 },
            size: 'small',
            shareDepth: 99,
            space: 'oklab',
        });

        expect(grammar.shareDepth).toBe(5);
        expect(serializeGrammar(grammar).shareDepth).toBe(5);
    });

    it('refuses corrupted weights instead of clamping them (throw-vs-repair policy)', () => {
        const base = { size: 'medium', shareDepth: 2, space: 'oklch' };

        expect(() =>
            deserializeGrammar(catalog, { ...base, weights: { x: Number.NaN, add: 1 } }),
        ).toThrow('Randomart: weight of operator "x" must be a finite number, received NaN');

        expect(() => deserializeGrammar(catalog, { ...base, weights: { x: 101, add: 1 } })).toThrow(
            'Randomart: weight of operator "x" must be an integer in [0, 4], received 101',
        );
    });

    it('relays createGrammar errors (unknown operator)', () => {
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1, nope: 1 },
                size: 'medium',
                shareDepth: 2,
                space: 'oklch',
            }),
        ).toThrow(/does not exist in catalog/);
    });
});
