import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import { MAX_IMPORT_DEPTH, MAX_IMPORT_NODES } from './constants';
import { createExpression, createNode } from './expression';
import { nodeKey } from './key';
import { deserialize, serialize } from './serialize';
import type { ExpressionData, NodeData } from './types';

describe('expression: serialize', () => {
    const catalog = createDefaultCatalog();

    it('writes canonical data: op first, params/in omitted when empty, op/params/in order', () => {
        const constNode = createNode(catalog, 'const', [], [0.3]);
        const sum = createNode(catalog, 'add', [
            createNode(catalog, 'x', [], [0, 0, 1]),
            constNode,
        ]);
        const expr = createExpression(sum, createNode(catalog, 'y', [], [0, 0, 1]), constNode);

        expect(serialize(expr)).toEqual({
            r: {
                op: 'add',
                in: [
                    { op: 'x', params: [0, 0, 1] },
                    { op: 'const', params: [0.3] },
                ],
            },
            g: { op: 'y', params: [0, 0, 1] },
            b: { op: 'const', params: [0.3] },
        });
    });

    it('round-trips through nodeKey for a varied expression', () => {
        const a = createNode(catalog, 'const', [], [0.5]);
        const b = createNode(catalog, 'y', [], [0, 0, 1]);
        const mix = createNode(catalog, 'mix', [a, b, a]);
        const expr = createExpression(mix, a, b);

        const back = deserialize(serialize(expr));
        expect(nodeKey(back.r)).toBe(nodeKey(expr.r));
        expect(nodeKey(back.g)).toBe(nodeKey(expr.g));
        expect(nodeKey(back.b)).toBe(nodeKey(expr.b));
    });

    it('normalizes -0 back to 0 on import', () => {
        const data: ExpressionData = {
            r: { op: 'const', params: [0] },
            g: { op: 'x', params: [0, 0, 1] },
            b: { op: 'y', params: [0, 0, 1] },
        };

        const back = deserialize(serialize(deserialize(data)));
        expect(nodeKey(back.r)).toBe('const[0]()');
    });
});

describe('expression: deserialize rejections', () => {
    const valid: ExpressionData = {
        r: { op: 'x', params: [0, 0, 1] },
        g: { op: 'y', params: [0, 0, 1] },
        b: { op: 'const', params: [0] },
    };

    it('rejects a non-object root with a clear message', () => {
        expect(() => deserialize('nope')).toThrow('object expected');
        expect(() => deserialize([valid])).toThrow('object expected');
    });

    it('rejects unknown fields with their path', () => {
        expect(() => deserialize({ ...valid, extra: 1 })).toThrow('unknown field "extra"');
        expect(() => deserialize({ r: { op: 'x', seed: 1 }, g: valid.g, b: valid.b })).toThrow(
            'Expression invalid at r: unknown field "seed"',
        );
    });

    it('rejects missing or mistyped channels', () => {
        expect(() => deserialize({ r: valid.r, g: valid.g })).toThrow('object expected');
        expect(() => deserialize({ r: { op: 5 }, g: valid.g, b: valid.b })).toThrow(
            'Expression invalid at r: string expected at "op"',
        );
    });

    it('relays createNode errors with their address', () => {
        expect(() => deserialize({ r: valid.r, g: { op: 'foo' }, b: valid.b })).toThrow(
            'Expression invalid at g: Unknown operator: "foo"',
        );

        expect(() =>
            deserialize({
                r: valid.r,
                g: { op: 'add', in: [{ op: 'x', params: [0, 0, 1] }] },
                b: valid.b,
            }),
        ).toThrow('Expression invalid at g: Operator "add" expects 2 inputs, received 1');

        expect(() =>
            deserialize({
                r: valid.r,
                g: {
                    op: 'add',
                    in: [
                        { op: 'x', params: [0, 0, 1] },
                        { op: 'const', params: [2] },
                    ],
                },
                b: valid.b,
            }),
        ).toThrow('Expression invalid at g.in[1]: Param "value" of operator "const" out of range');

        expect(() =>
            deserialize({
                r: {
                    op: 'add',
                    in: [{ op: 'x', params: [0, 0, 1] }, [{ op: 'y' }]],
                },
                g: valid.g,
                b: valid.b,
            }),
        ).toThrow('Expression invalid at r.in[1]: object expected');
    });

    it('rejects non-number params', () => {
        expect(() =>
            deserialize({
                r: { op: 'const', params: ['0.3'] },
                g: valid.g,
                b: valid.b,
            }),
        ).toThrow('Expression invalid at r.params[0]: number expected');
    });

    it('rejects more than MAX_IMPORT_NODES nodes in total (all channels)', () => {
        const tree = (d: number): NodeData =>
            d === 0
                ? { op: 'x', params: [0, 0, 1] }
                : { op: 'add', in: [tree(d - 1), tree(d - 1)] };

        // A full binary tree of depth 13 holds 2^13 - 1 = 8191 nodes.
        expect(() => deserialize({ r: tree(13), g: valid.g, b: valid.b })).toThrow(
            `more than ${MAX_IMPORT_NODES} nodes`,
        );

        // Under the limit on the same shape: accepted.
        expect(() => deserialize({ r: tree(11), g: valid.g, b: valid.b })).not.toThrow();
    });

    it('rejects a depth above MAX_IMPORT_DEPTH before building any node', () => {
        const chain = (d: number): NodeData =>
            d === 0 ? { op: 'x', params: [0, 0, 1] } : { op: 'sin', in: [chain(d - 1)] };

        expect(() =>
            deserialize({ r: chain(MAX_IMPORT_DEPTH + 1), g: valid.g, b: valid.b }),
        ).toThrow(`deeper than ${MAX_IMPORT_DEPTH} levels`);

        expect(() =>
            deserialize({ r: chain(MAX_IMPORT_DEPTH - 1), g: valid.g, b: valid.b }),
        ).not.toThrow();
    });
});
