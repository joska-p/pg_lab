import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import { lower } from './lower.ts';

describe('lower', () => {
    const catalog = createDefaultCatalog();

    describe('topological ordering and structure', () => {
        it('assigns ids in strict topological order (children before parents)', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const add = createNode(catalog, 'add', [sinX, y]);
            const expr = createExpression(add, sinX, x);

            const result = lower(catalog, expr);

            expect(result.vertices.length).toBeGreaterThan(0);
            for (const vertex of result.vertices) {
                expect(result.vertices[vertex.id]).toBe(vertex);
                for (const inputId of vertex.inputIds) {
                    expect(inputId).toBeLessThan(vertex.id);
                }
            }
        });

        it('returns frozen vertices, usages, and valid root ids', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const expr = createExpression(x, x, x);
            const result = lower(catalog, expr);

            expect(Object.isFrozen(result.vertices)).toBe(true);
            expect(Object.isFrozen(result.usages)).toBe(true);
            expect(result.roots).toEqual([0, 0, 0]);
            expect(result.vertices.length).toBe(1);
            expect(result.vertices[0].operatorName).toBe('x');
            expect(result.vertices[0].context).toBe('root');
        });
    });

    describe('hash-consing / deduplication', () => {
        it('deduplicates identical sub-expressions across channels', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const add = createNode(catalog, 'add', [sinX, y]);

            // r, g, b all share sinX and y
            const expr = createExpression(add, sinX, y);
            const result = lower(catalog, expr);

            // Vertices should be: x (0), sin(x) (1), y (2), add(sinX, y) (3)
            expect(result.vertices).toHaveLength(4);
            expect(result.roots).toEqual([3, 1, 2]);
        });

        it('deduplicates identical subtrees even when built as separate AST node objects', () => {
            const x1 = createNode(catalog, 'x', [], [0, 0, 0]);
            const x2 = createNode(catalog, 'x', [], [0, 0, 0]);
            const sin1 = createNode(catalog, 'sin', [x1]);
            const sin2 = createNode(catalog, 'sin', [x2]);
            const expr = createExpression(sin1, sin2, x1);

            const result = lower(catalog, expr);

            // Exactly 2 vertices: x (0) and sin(x) (1)
            expect(result.vertices).toHaveLength(2);
            expect(result.roots).toEqual([1, 1, 0]);
        });

        it('distinguishes operators with different parameters', () => {
            const c1 = createNode(catalog, 'const', [], [0.25]);
            const c2 = createNode(catalog, 'const', [], [0.75]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const expr = createExpression(c1, c2, x);

            const result = lower(catalog, expr);

            expect(result.vertices).toHaveLength(3);
            expect(result.vertices[0].params).toEqual([0.25]);
            expect(result.vertices[1].params).toEqual([0.75]);
        });
    });

    describe('usages counting', () => {
        it('adds +1 usage per channel root', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const z = createNode(catalog, 'const', [], [0.5]);
            const expr = createExpression(x, y, z);

            const result = lower(catalog, expr);

            expect(result.usages[result.roots[0]]).toBe(1);
            expect(result.usages[result.roots[1]]).toBe(1);
            expect(result.usages[result.roots[2]]).toBe(1);
        });

        it('accumulates multiple root usages when channels share the same root', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            // r, g, b are all x
            const expr = createExpression(x, x, x);
            const result = lower(catalog, expr);

            expect(result.vertices).toHaveLength(1);
            expect(result.roots).toEqual([0, 0, 0]);
            // Root usage = 1 + 1 + 1 = 3
            expect(result.usages[0]).toBe(3);
        });

        it('applies operator input multiplicity to child usages', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const sqrX = createNode(catalog, 'sqr', [x]); // sqr multiplicity is 2
            const expr = createExpression(sqrX, x, x);

            const result = lower(catalog, expr);

            // Vertices: x (0), sqr(x) (1)
            // Roots: r = 1, g = 0, b = 0
            // Usages for x (0):
            // - used by sqrX: +2 (multiplicity 2)
            // - used as root g: +1
            // - used as root b: +1
            // Total for x = 4
            expect(result.usages[0]).toBe(4);
            // Usages for sqrX (1):
            // - used as root r: +1
            expect(result.usages[1]).toBe(1);
        });

        it('does NOT re-accumulate child usages when an existing vertex is reused', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]); // x is child of sinX
            const add1 = createNode(catalog, 'add', [sinX, x]);
            const add2 = createNode(catalog, 'add', [sinX, x]); // identical to add1!
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const expr = createExpression(add1, add2, y);

            const result = lower(catalog, expr);

            // Vertices:
            // 0: x
            // 1: sin(x)
            // 2: add(sin(x), x) (add2 is deduplicated to vertex 2)
            // 3: y
            expect(result.vertices).toHaveLength(4);

            // Roots: r = 2, g = 2, b = 3
            // Usages for vertex 2 (add):
            // - root r: +1
            // - root g: +1
            // Total = 2
            expect(result.usages[2]).toBe(2);

            // Usages for vertex 1 (sin(x)):
            // - child of add(sin(x), x): +1
            // (When add2 is visited, add is already in map, so sin(x) usage is not re-incremented)
            expect(result.usages[1]).toBe(1);

            // Usages for vertex 0 (x):
            // - child of sin(x): +1
            // - child of add(sin(x), x): +1
            // Total = 2
            expect(result.usages[0]).toBe(2);
        });
    });

    describe('coordinate contexts and interning', () => {
        it('lowers warp node into a child context c1', () => {
            const dx = createNode(catalog, 'const', [], [0.1]);
            const dy = createNode(catalog, 'const', [], [0.2]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const warpNode = createNode(catalog, 'warp', [dx, dy, x]);
            const expr = createExpression(warpNode, dx, dy);

            const result = lower(catalog, expr);

            expect(result.contexts).toHaveLength(1);
            expect(result.contexts[0].name).toBe('c1');
            expect(result.contexts[0].parentName).toBe('root');
            expect(result.contexts[0].operatorName).toBe('warp');

            // x inside warp is evaluated in c1
            const innerX = result.vertices.find((v) => v.operatorName === 'x');
            expect(innerX).toBeDefined();
            expect(innerX?.context).toBe('c1');
        });

        it('deduplicates identical contexts across channels (interning)', () => {
            const dx = createNode(catalog, 'const', [], [0.1]);
            const dy = createNode(catalog, 'const', [], [0.2]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const warp1 = createNode(catalog, 'warp', [dx, dy, x]);
            const warp2 = createNode(catalog, 'warp', [dx, dy, y]);
            const expr = createExpression(warp1, warp2, dx);

            const result = lower(catalog, expr);

            // Exactly ONE context created because (parent, warp, params, [dx, dy]) is identical
            expect(result.contexts).toHaveLength(1);
            expect(result.contexts[0].name).toBe('c1');
        });

        it('produces two vertices for same terminal in different contexts', () => {
            const dx1 = createNode(catalog, 'const', [], [0.1]);
            const dy1 = createNode(catalog, 'const', [], [0.2]);
            const dx2 = createNode(catalog, 'const', [], [0.3]);
            const dy2 = createNode(catalog, 'const', [], [0.4]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);

            const warp1 = createNode(catalog, 'warp', [dx1, dy1, x]);
            const warp2 = createNode(catalog, 'warp', [dx2, dy2, x]);
            const expr = createExpression(warp1, warp2, x);

            const result = lower(catalog, expr);

            // Two distinct contexts
            expect(result.contexts).toHaveLength(2);
            expect(result.contexts.map((c) => c.name)).toEqual(['c1', 'c2']);

            // x in c1, x in c2, and x in root are 3 separate vertices!
            const xVertices = result.vertices.filter((v) => v.operatorName === 'x');
            expect(xVertices).toHaveLength(3);
            expect(xVertices.map((v) => v.context).sort()).toEqual(['c1', 'c2', 'root']);
        });

        it('preserves topological order between vertices and contexts in program', () => {
            const dx = createNode(catalog, 'const', [], [0.1]);
            const dy = createNode(catalog, 'const', [], [0.2]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const warpNode = createNode(catalog, 'warp', [dx, dy, x]);
            const expr = createExpression(warpNode, dx, dy);

            const result = lower(catalog, expr);

            // In program: dx & dy vertices come before context c1, which comes before x in c1, which comes before warp
            const dxIdx = result.program.findIndex(
                (item) => item.kind === 'vertex' && item.vertex.operatorName === 'const',
            );
            const c1Idx = result.program.findIndex((item) => item.kind === 'context');
            const xIdx = result.program.findIndex(
                (item) => item.kind === 'vertex' && item.vertex.operatorName === 'x',
            );
            const warpIdx = result.program.findIndex(
                (item) => item.kind === 'vertex' && item.vertex.operatorName === 'warp',
            );

            expect(dxIdx).toBeLessThan(c1Idx);
            expect(c1Idx).toBeLessThan(xIdx);
            expect(xIdx).toBeLessThan(warpIdx);
        });

        it('accumulates mc usages on current inputs when context is created, but not on reuse', () => {
            const dx = createNode(catalog, 'const', [], [0.1]);
            const dy = createNode(catalog, 'const', [], [0.2]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const warp1 = createNode(catalog, 'warp', [dx, dy, x]);
            const warp2 = createNode(catalog, 'warp', [dx, dy, y]);
            const zero = createNode(catalog, 'const', [], [0]);
            const expr = createExpression(warp1, warp2, zero);

            const result = lower(catalog, expr);

            // dx and dy vertices
            // Used by context c1 (mc = [1, 1])
            // When warp2 reuses context c1, mc is NOT added again.
            const dxVertex = result.vertices.find((v) => v.params[0] === 0.1)!;
            const dyVertex = result.vertices.find((v) => v.params[0] === 0.2)!;
            expect(result.usages[dxVertex.id]).toBe(1);
            expect(result.usages[dyVertex.id]).toBe(1);
        });
    });
});
