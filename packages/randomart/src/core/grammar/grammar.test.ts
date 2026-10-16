import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createConstraints, createGrammar, defaultGrammar, minSize } from './index.ts';

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

    it('rejects invalid depth bounds', () => {
        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 5, maxDepth: 3, maxNodes: 20 },
            }),
        ).toThrow('Randomart: constraints.minDepth (5) must not exceed constraints.maxDepth (3)');

        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 0, maxDepth: 3, maxNodes: 20 },
            }),
        ).toThrow('Randomart: constraints.minDepth must be an integer in [1, 16], received 0');
    });

    it('rejects minDepth > 1 without active non-terminals', () => {
        const catalog = createDefaultCatalog();
        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1, y: 1, add: 0, mul: 0 },
                constraints: { minDepth: 2, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow(/contains no non-terminal/);
    });

    it('rejects constraints exceeding hard limits', () => {
        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 17, maxNodes: 20 },
            }),
        ).toThrow('Randomart: constraints.maxDepth must be an integer in [1, 16], received 17');

        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 10, maxNodes: 401 },
            }),
        ).toThrow('Randomart: constraints.maxNodes must be an integer in [1, 400], received 401');
    });

    it('rejects unfeasible maxNodes lower than minSize(1)', () => {
        // minDepth 4 with binary operator only requires 15 nodes minimum
        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1, add: 1 },
                constraints: { minDepth: 4, maxDepth: 6, maxNodes: 14 },
            }),
        ).toThrow(/unfeasible/);
    });
});

describe('grammar: createConstraints', () => {
    it('brands and freezes valid constraints', () => {
        const constraints = createConstraints({ minDepth: 2, maxDepth: 8, maxNodes: 60 });

        expect(constraints).toEqual({ minDepth: 2, maxDepth: 8, maxNodes: 60 });
        expect(Object.isFrozen(constraints)).toBe(true);
    });

    it('rejects out-of-range bounds', () => {
        expect(() => createConstraints({ minDepth: 0, maxDepth: 8, maxNodes: 60 })).toThrow(
            'Randomart: constraints.minDepth must be an integer in [1, 16], received 0',
        );
        expect(() => createConstraints({ minDepth: 1, maxDepth: 17, maxNodes: 60 })).toThrow(
            'Randomart: constraints.maxDepth must be an integer in [1, 16], received 17',
        );
        expect(() => createConstraints({ minDepth: 1, maxDepth: 8, maxNodes: 0 })).toThrow(
            'Randomart: constraints.maxNodes must be an integer in [1, 400], received 0',
        );
    });

    it('rejects integer/finite violations', () => {
        expect(() => createConstraints({ minDepth: 1.5, maxDepth: 8, maxNodes: 60 })).toThrow(
            'Randomart: constraints.minDepth must be an integer, received 1.5',
        );
        expect(() => createConstraints({ minDepth: 1, maxDepth: 8, maxNodes: Number.NaN })).toThrow(
            'Randomart: constraints.maxNodes must be a finite number, received NaN',
        );
    });

    it('rejects minDepth above maxDepth after both are in range', () => {
        expect(() => createConstraints({ minDepth: 5, maxDepth: 3, maxNodes: 60 })).toThrow(
            'Randomart: constraints.minDepth (5) must not exceed constraints.maxDepth (3)',
        );
    });
});

describe('grammar: defaultGrammar', () => {
    const catalog = createDefaultCatalog();

    it('builds the default vocabulary', () => {
        const g = defaultGrammar(catalog);
        expect(g.weights.x).toBe(3);
        expect(g.weights.y).toBe(3);
        expect(g.weights.const).toBe(1);
        expect(g.weights.tsin).toBe(1);
        expect(g.weights.tcos).toBe(1);
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
            expect(g.weights[operator.name]).toBeDefined();
        }
    });
});
