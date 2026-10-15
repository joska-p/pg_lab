import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createGrammar, defaultGrammar, minSize } from './index.ts';

describe('grammar: minSize', () => {
    const catalog = createDefaultCatalog();

    it('calculates minSize correctly for binary only non-terminals', () => {
        const binaryOps = [catalog.operator('add')];
        // minDepth = 4, k = 2
        // d=4: 1
        // d=3: 1 + 2*1 = 3
        // d=2: 1 + 2*3 = 7
        // d=1: 1 + 2*7 = 15
        expect(minSize(4, 4, binaryOps)).toBe(1);
        expect(minSize(3, 4, binaryOps)).toBe(3);
        expect(minSize(2, 4, binaryOps)).toBe(7);
        expect(minSize(1, 4, binaryOps)).toBe(15);
    });

    it('calculates minSize correctly when unary non-terminal is available', () => {
        const unaryAndBinary = [catalog.operator('neg'), catalog.operator('add')];
        // minDepth = 4, k = 1
        // d=4: 1
        // d=3: 1 + 1*1 = 2
        // d=2: 1 + 1*2 = 3
        // d=1: 1 + 1*3 = 4
        expect(minSize(1, 4, unaryAndBinary)).toBe(4);
    });

    it('returns 1 when d >= minDepth', () => {
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

    it('accepts weight 0 (off) and rejects negatives or > 100', () => {
        const catalog = createDefaultCatalog();
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
        ).toThrow(/must be within/);

        expect(() =>
            createGrammar(catalog, {
                weights: { x: 101 },
                constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            }),
        ).toThrow(/must be within/);
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
        ).toThrow(/1 <= minDepth <= maxDepth/);

        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 0, maxDepth: 3, maxNodes: 20 },
            }),
        ).toThrow(/1 <= minDepth <= maxDepth/);
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
        ).toThrow(/exceeds hard limit MAX_DEPTH/);

        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 10, maxNodes: 401 },
            }),
        ).toThrow(/exceeds hard limit MAX_NODES/);
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

        for (const op of catalog.operators()) {
            expect(g.weights[op.name]).toBeDefined();
        }
    });
});
