import { describe, expect, it } from 'vite-plus/test';

import { COLOR_SPACE_IDS } from './colors';
import { compile } from './emit';
import { RandomArtError } from './errors';
import { generate } from './generate';
import { grammarRegistry } from './grammar';
import { seedOf, SIZE_GRAMMARS } from './testing/fixtures';
import {
    createExpression,
    createNode,
    deserialize,
    formatFormula,
    isMonoExpression,
    serialize,
} from './tree';
import type { Expression } from './tree';

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
        for (const grammar of SIZE_GRAMMARS) {
            for (const seed of [0, 42]) {
                const expression = generate(grammar, seedOf(seed));

                expect(formulas(throughJson(expression))).toEqual(formulas(expression));
            }
        }
    });

    it('produces byte-identical JSON and shader after a round-trip', () => {
        const expression = generate(grammarRegistry.default.grammar, seedOf(2024));
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

describe('createNode', () => {
    const a = createNode('const', [], { value: 0 });
    const b = createNode('const', [], { value: 1 });

    it('rejects an unknown parameter on a terminal', () => {
        expect(() => createNode('const', [], { value: 0, nope: 1 })).toThrow(/no parameter/);
    });

    it('rejects an unknown parameter on an operator with inputs', () => {
        expect(() => createNode('add', [a, b], { foo: 1 })).toThrow(/no parameter/);
    });

    it('rejects a parameter out of range', () => {
        expect(() => createNode('x', [], { amp: 2, phase: 0, cycles: 1 })).toThrow(/out of/);
    });
});

describe('isMonoExpression', () => {
    const xNode = (overrides: Partial<Record<'amp' | 'phase' | 'cycles', number>> = {}) =>
        createNode('x', [], { amp: 0.3, phase: 0.1, cycles: 2, ...overrides });

    it('treats three structurally identical trees built separately as mono', () => {
        expect(isMonoExpression(createExpression(xNode(), xNode(), xNode()))).toBe(true);
    });

    it('is false when one channel differs in a parameter', () => {
        const xLow = createNode('x', [], { amp: 0.1, phase: 0, cycles: 1 });
        const xHigh = createNode('x', [], { amp: 0.2, phase: 0, cycles: 1 });
        expect(isMonoExpression(createExpression(xLow, xLow, xHigh))).toBe(false);
    });

    it('is false when one channel has a different shape', () => {
        const xx = createNode('add', [xNode(), xNode()]);
        const xy = createNode('add', [
            xNode(),
            createNode('y', [], { amp: 0.3, phase: 0.1, cycles: 2 }),
        ]);
        expect(isMonoExpression(createExpression(xx, xx, xy))).toBe(false);
    });

    it('is true for every expression drawn from the monochrome grammar', () => {
        for (const n of [1, 2, 3, 4, 5]) {
            const expression = generate(grammarRegistry.monochrome.grammar, seedOf(n));
            expect(isMonoExpression(expression)).toBe(true);
        }
    });
});
