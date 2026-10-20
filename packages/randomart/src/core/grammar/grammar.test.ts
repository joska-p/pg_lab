import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import {
    createConstraints,
    createGrammar,
    DEFAULT_CONSTRAINTS,
    defaultGrammar,
    isLastTerminal,
    minSize,
} from './index.ts';

/** Copies a grammar's partial weights into a mutable full record, absent entries becoming 0. */
function mutableWeights(grammar: {
    weights: Readonly<Record<string, number | undefined>>;
}): Record<string, number> {
    const weights: Record<string, number> = {};

    for (const [name, weight] of Object.entries(grammar.weights)) {
        weights[name] = weight ?? 0;
    }

    return weights;
}

describe('grammar: minSize', () => {
    const catalog = createDefaultCatalog();

    it('calculates minSize correctly for binary only non-terminals', () => {
        const binaryOperators = [catalog.operator('add')];
        // minDepth = 4, k = 2
        // currentDepth=4: 1
        // currentDepth=3: 1 + 2*1 = 3
        // currentDepth=2: 1 + 2*3 = 7
        // currentDepth=1: 1 + 2*7 = 15
        expect(minSize(4, 4, binaryOperators)).toBe(1);
        expect(minSize(3, 4, binaryOperators)).toBe(3);
        expect(minSize(2, 4, binaryOperators)).toBe(7);
        expect(minSize(1, 4, binaryOperators)).toBe(15);
    });

    it('calculates minSize correctly when unary non-terminal is available', () => {
        const unaryAndBinaryOperators = [catalog.operator('neg'), catalog.operator('add')];
        // minDepth = 4, k = 1
        // currentDepth=4: 1
        // currentDepth=3: 1 + 1*1 = 2
        // currentDepth=2: 1 + 1*2 = 3
        // currentDepth=1: 1 + 1*3 = 4
        expect(minSize(1, 4, unaryAndBinaryOperators)).toBe(4);
    });

    it('returns 1 when currentDepth >= minDepth', () => {
        expect(minSize(5, 3, [catalog.operator('add')])).toBe(1);
    });
});

describe('grammar: createGrammar validations', () => {
    const catalog = createDefaultCatalog();

    it('rejects unknown operator', () => {
        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1, nonexistent: 1 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow(/does not exist in catalog/);
    });

    it('accepts weight 0 (off) and rejects negative or > 100 weights', () => {
        expect(
            createGrammar(catalog, {
                weights: { x: 0, y: 0, const: 1 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toBeTruthy();

        expect(() =>
            createGrammar(catalog, {
                weights: { x: -1e-9 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow('Randomart: weight of operator "x" (-1e-9) must be within [0, 100]');

        expect(() =>
            createGrammar(catalog, {
                weights: { x: 101 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow('Randomart: weight of operator "x" (101) must be within [0, 100]');
    });

    it('rejects non-finite weights', () => {
        expect(() =>
            createGrammar(catalog, {
                weights: { x: Number.NaN },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow('Randomart: weight of operator "x" must be a finite number, received NaN');
    });

    it('rejects empty weights', () => {
        expect(() =>
            createGrammar(catalog, {
                weights: {},
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow('Randomart: grammar weights must not be empty');
    });

    it('rejects vocabulary without active terminals', () => {
        const catalog = createDefaultCatalog();
        expect(() =>
            createGrammar(catalog, {
                weights: { add: 1, mul: 0, x: 0, y: 0, const: 0 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow(/must contain at least one terminal/);
    });

    it('repairs depth-bound violations instead of refusing them (throw-vs-repair policy)', () => {
        // minDepth > maxDepth: the core repair clamps minDepth down (maxDepth wins), and without
        // non-terminals minDepth falls back to 1 (rule 5 as repair).
        const crossed = createGrammar(catalog, {
            weights: { x: 1 },
            constraints: { minDepth: 5, maxDepth: 3, maxNodes: 20 },
        });

        expect(crossed.constraints).toEqual({ minDepth: 1, maxDepth: 3, maxNodes: 20 });

        expect(
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 0, maxDepth: 3, maxNodes: 20 },
            }).constraints,
        ).toEqual({ minDepth: 1, maxDepth: 3, maxNodes: 20 });
    });

    it('repairs constraints exceeding the hard limits', () => {
        expect(
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 17, maxNodes: 20 },
            }).constraints,
        ).toEqual({ minDepth: 1, maxDepth: 16, maxNodes: 20 });

        expect(
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 10, maxNodes: 401 },
            }).constraints,
        ).toEqual({ minDepth: 1, maxDepth: 10, maxNodes: 400 });
    });

    it('repairs rule 5 (minDepth > 1 without active non-terminals) by yielding', () => {
        expect(
            createGrammar(catalog, {
                weights: { x: 1, y: 1, add: 0, mul: 0 },
                constraints: { minDepth: 2, maxDepth: 4, maxNodes: 20 },
            }).constraints,
        ).toEqual({ minDepth: 1, maxDepth: 4, maxNodes: 20 });
    });

    it('repairs unfeasible maxNodes by raising it to minSize(1) (rule 7 as repair)', () => {
        // minDepth 4 with binary operator only requires 15 nodes minimum.
        expect(
            createGrammar(catalog, {
                weights: { x: 1, add: 1 },
                constraints: { minDepth: 4, maxDepth: 6, maxNodes: 14 },
            }).constraints,
        ).toEqual({ minDepth: 4, maxDepth: 6, maxNodes: 15 });
    });
});

describe('grammar: createConstraints', () => {
    it('brands and freezes valid constraints', () => {
        const constraints = createConstraints({ minDepth: 2, maxDepth: 8, maxNodes: 60 });

        expect(constraints).toEqual({ minDepth: 2, maxDepth: 8, maxNodes: 60 });
        expect(Object.isFrozen(constraints)).toBe(true);
    });

    it('repairs broken constraints instead of refusing them (throw-vs-repair policy)', () => {
        // Out-of-range bounds clamp to the hard limits…
        expect(createConstraints({ minDepth: 0, maxDepth: 8, maxNodes: 60 })).toEqual({
            minDepth: 1,
            maxDepth: 8,
            maxNodes: 60,
        });
        expect(createConstraints({ minDepth: 1, maxDepth: 17, maxNodes: 60 })).toEqual({
            minDepth: 1,
            maxDepth: 16,
            maxNodes: 60,
        });
        expect(createConstraints({ minDepth: 1, maxDepth: 8, maxNodes: 0 })).toEqual({
            minDepth: 1,
            maxDepth: 8,
            maxNodes: 1,
        });

        // … a conflict resolves to equal bounds, with maxDepth winning…
        expect(createConstraints({ minDepth: 5, maxDepth: 3, maxNodes: 60 })).toEqual({
            minDepth: 3,
            maxDepth: 3,
            maxNodes: 60,
        });

        // … and finite garbage is rounded, not rejected.
        expect(createConstraints({ minDepth: 1.5, maxDepth: 8, maxNodes: 60 })).toEqual({
            minDepth: 2,
            maxDepth: 8,
            maxNodes: 60,
        });
    });

    it('repairs non-finite values to the concept defaults', () => {
        // Non-finite is garbage, not intent — and the fallback is per field: only the non-finite
        // `maxNodes` falls back to its concept default; the given depths keep their values.
        expect(createConstraints({ minDepth: 1, maxDepth: 8, maxNodes: Number.NaN })).toEqual({
            minDepth: 1,
            maxDepth: 8,
            maxNodes: 60,
        });

        // All non-finite: the shape collapses to the `defaultGrammar` one (DEFAULT_CONSTRAINTS).
        expect(
            createConstraints({
                minDepth: Number.NaN,
                maxDepth: Number.POSITIVE_INFINITY,
                maxNodes: 60,
            }),
        ).toEqual(DEFAULT_CONSTRAINTS);
    });
});

describe('grammar: defaultGrammar', () => {
    const catalog = createDefaultCatalog();

    it('builds the default vocabulary (calibrated for structure)', () => {
        const g = defaultGrammar(catalog);
        expect(g.weights.x).toBe(4);
        expect(g.weights.y).toBe(4);
        expect(g.weights.max).toBe(2);
        expect(g.weights.min).toBe(1.5);
        expect(g.weights.const).toBe(0.5);
        expect(g.weights.mix).toBe(0.5);
        expect(g.weights.select).toBe(0.5);
        expect(g.weights.warp).toBe(0.5);
        expect(g.constraints).toEqual({
            minDepth: 3,
            maxDepth: 8,
            maxNodes: 60,
        });
    });

    it('covers the whole catalog', () => {
        const g = defaultGrammar(catalog);

        for (const operator of catalog.operators()) {
            expect(Object.hasOwn(g.weights, operator.name)).toBe(true);
        }
    });
});

describe('grammar: isLastTerminal', () => {
    const catalog = createDefaultCatalog();
    const terminals = catalog.operators().filter((operator) => operator.isTerminal);

    it('is false while several terminals are active', () => {
        const { weights } = defaultGrammar(catalog);

        for (const terminal of terminals) {
            expect(isLastTerminal(catalog, weights, terminal.name)).toBe(false);
        }
    });

    it('is true for the only active terminal, and false for an inactive one', () => {
        const weights = mutableWeights(defaultGrammar(catalog));

        for (const terminal of terminals) {
            weights[terminal.name] = terminal.name === 'x' ? 1 : 0;
        }

        expect(isLastTerminal(catalog, weights, 'x')).toBe(true);
        // A terminal that is off is not "the last terminal": there is nothing to switch off.
        expect(isLastTerminal(catalog, weights, 'y')).toBe(false);
    });

    it('tracks exactly what createGrammar refuses when emptying the terminals', () => {
        const weights = mutableWeights(defaultGrammar(catalog));

        for (const terminal of terminals) {
            weights[terminal.name] = terminal.name === 'x' ? 1 : 0;
        }

        expect(isLastTerminal(catalog, weights, 'x')).toBe(true);
        expect(() =>
            createGrammar(catalog, {
                weights: { ...weights, x: 0 },
                constraints: DEFAULT_CONSTRAINTS,
            }),
        ).toThrow(/at least one terminal/);
    });
});
