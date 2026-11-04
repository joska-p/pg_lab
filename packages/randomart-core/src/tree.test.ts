import { describe, expect, it } from 'vite-plus/test';

import { COLOR_SPACE_IDS } from './colors';
import { compile } from './emit';
import { RandomArtError } from './errors';
import { generate } from './generate';
import { createGrammar, grammarRegistry } from './grammar';
import { createSeed } from './seed';
import { deserialize, formatFormula, serialize } from './tree';
import type { Expression } from './tree';

/** Numeric seeds are convenience labels here; the identity is their decimal string. */
const seedOf = (value: number) => createSeed(String(value));

function canonical(expression: Expression): string {
    return JSON.stringify(serialize(expression));
}

function formulas(expression: Expression): readonly string[] {
    return [formatFormula(expression.r), formatFormula(expression.g), formatFormula(expression.b)];
}

/** The real persistence path: serialize, cross a JSON boundary, deserialize. */
function throughJson(expression: Expression): Expression {
    return deserialize(JSON.parse(JSON.stringify(serialize(expression))));
}

describe('tree serialization', () => {
    it('preserves the formula through JSON for every depth/node bound', () => {
        const grammars = [
            createGrammar({
                weights: grammarRegistry.default.weights,
                minDepth: 1,
                maxDepth: 3,
                maxNodes: 12,
                shareDepth: 1,
                space: 'srgb',
            }),
            createGrammar({
                weights: grammarRegistry.default.weights,
                minDepth: 2,
                maxDepth: 5,
                maxNodes: 25,
                shareDepth: 2,
                space: 'srgb',
            }),
            createGrammar({
                weights: grammarRegistry.default.weights,
                minDepth: 3,
                maxDepth: 7,
                maxNodes: 50,
                shareDepth: 3,
                space: 'srgb',
            }),
        ];

        for (const grammar of grammars) {
            for (const seed of [0, 42]) {
                const expression = generate(grammar, seedOf(seed));

                expect(formulas(throughJson(expression))).toEqual(formulas(expression));
            }
        }
    });

    it('produces byte-identical JSON and shader after a round-trip', () => {
        const expression = generate(grammarRegistry.default, seedOf(2024));
        const restored = throughJson(expression);

        expect(canonical(restored)).toBe(canonical(expression));

        for (const space of COLOR_SPACE_IDS) {
            expect(compile(restored, { space })).toEqual(compile(expression, { space }));
        }
    });

    it('rejects malformed data at the boundary', () => {
        const terminal = { op: 'const', params: { value: 0 } };
        const valid = { version: 2, r: terminal, g: terminal, b: terminal };

        expect(() => deserialize({ ...valid, version: 1 })).toThrow(RandomArtError);
        expect(() => deserialize({ ...valid, version: 1 })).toThrow(/version mismatch/);
        expect(() => deserialize({ ...valid, r: { op: 'bogus' } })).toThrow(/unknown operator/);
        expect(() => deserialize({ ...valid, r: { op: 'sin' } })).toThrow(/1 input\(s\) expected/);
        expect(() => deserialize({ ...valid, r: { op: 'add', in: [terminal] } })).toThrow(
            /2 input\(s\) expected/,
        );
        expect(() => deserialize({ ...valid, r: { op: 'const', params: { value: 2 } } })).toThrow(
            /out of/,
        );
        expect(() =>
            deserialize({ ...valid, r: { op: 'const', params: { value: 0, nope: 1 } } }),
        ).toThrow(/no parameter/);
        expect(() =>
            deserialize({ ...valid, r: { op: 'const', params: { value: 0 }, extra: 1 } }),
        ).toThrow(/unknown field/);
    });
});
