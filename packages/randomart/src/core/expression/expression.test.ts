import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createExpression, createNode, depth, nodeCount } from './index.ts';

describe('expression: createNode & createExpression', () => {
    const catalog = createDefaultCatalog();

    it('creates terminal node and freezes it', () => {
        const xNode = createNode(catalog, 'x');
        expect(xNode.op).toBe('x');
        expect(xNode.inputs).toEqual([]);
        expect(xNode.params).toEqual([]);
        expect(Object.isFrozen(xNode)).toBe(true);
        expect(Object.isFrozen(xNode.inputs)).toBe(true);
        expect(Object.isFrozen(xNode.params)).toBe(true);
    });

    it('creates constant node with normalized -0', () => {
        const constNode = createNode(catalog, 'const', [], [-0]);
        expect(constNode.params[0]).toBe(0);
        expect(Object.is(constNode.params[0], -0)).toBe(false);
    });

    it('rejects unknown operator', () => {
        expect(() => createNode(catalog, 'unknown_op')).toThrow(/Unknown operator/);
    });

    it('rejects input arity mismatch', () => {
        const xNode = createNode(catalog, 'x');
        expect(() => createNode(catalog, 'add', [xNode])).toThrow(
            /Operator "add" expects 2 inputs, received 1/,
        );
    });

    it('rejects param count mismatch', () => {
        expect(() => createNode(catalog, 'const', [], [])).toThrow(
            /Operator "const" expects 1 params, received 0/,
        );
    });

    it('rejects param out of range', () => {
        expect(() => createNode(catalog, 'const', [], [1.5])).toThrow(/out of range/);
        expect(() => createNode(catalog, 'const', [], [-2])).toThrow(/out of range/);
        expect(() => createNode(catalog, 'const', [], [Number.NaN])).toThrow(/finite number/);
    });

    it('creates an expression and calculates metrics', () => {
        const x = createNode(catalog, 'x');
        const y = createNode(catalog, 'y');
        const sum = createNode(catalog, 'add', [x, y]);
        const sinSum = createNode(catalog, 'sin', [sum]);

        const expr = createExpression(x, sum, sinSum);
        expect(Object.isFrozen(expr)).toBe(true);

        expect(depth(x)).toBe(1);
        expect(depth(sum)).toBe(2);
        expect(depth(sinSum)).toBe(3);

        expect(nodeCount(x)).toBe(1);
        expect(nodeCount(sum)).toBe(3);
        expect(nodeCount(sinSum)).toBe(4);
        expect(nodeCount(expr)).toBe(1 + 3 + 4);
    });
});
