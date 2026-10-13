import { describe, expect, it } from 'vite-plus/test';

import { createCatalog, createDefaultCatalog, defineOperator } from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import { lower, probeMultiplicities } from './lower.ts';

describe('lower (MP3·S1)', () => {
    const catalog = createDefaultCatalog();

    describe('probeMultiplicities', () => {
        it('returns empty array for terminal operators with 0 inputs', () => {
            expect(probeMultiplicities(catalog, 'x', [])).toEqual([]);
            expect(probeMultiplicities(catalog, 'y', [])).toEqual([]);
            expect(probeMultiplicities(catalog, 'const', [0.5])).toEqual([]);
        });

        it('returns [1] for single-input operators with 1 occurrence in GLSL', () => {
            expect(probeMultiplicities(catalog, 'sin', [])).toEqual([1]);
            expect(probeMultiplicities(catalog, 'cos', [])).toEqual([1]);
            expect(probeMultiplicities(catalog, 'neg', [])).toEqual([1]);
            expect(probeMultiplicities(catalog, 'abs', [])).toEqual([1]);
        });

        it('returns [1, 1] for binary operators', () => {
            expect(probeMultiplicities(catalog, 'add', [])).toEqual([1, 1]);
            expect(probeMultiplicities(catalog, 'mul', [])).toEqual([1, 1]);
            expect(probeMultiplicities(catalog, 'min', [])).toEqual([1, 1]);
            expect(probeMultiplicities(catalog, 'max', [])).toEqual([1, 1]);
        });

        it('detects multiple occurrences: sqr has multiplicity 2 on its single input', () => {
            // sqr is defined as a * a, so input 0 appears twice
            expect(probeMultiplicities(catalog, 'sqr', [])).toEqual([2]);
        });

        it('detects arbitrary multiplicities for custom operators', () => {
            const tripleOp = defineOperator({
                name: 'triple_use',
                family: 'arithmetic',
                inputs: [{ type: 'float' }],
                output: 'float',
                glsl: (inputs) => `(${inputs[0]} * ${inputs[0]} + ${inputs[0]})`,
            });
            const customCat = createCatalog({
                operators: [...catalog.operators(), tripleOp],
                dependencies: [
                    {
                        kind: 'uniform',
                        name: 'u_phase',
                        glslType: 'float',
                    },
                ],
            });
            expect(probeMultiplicities(customCat, 'triple_use', [])).toEqual([3]);
        });
    });

    describe('topological ordering and structure', () => {
        it('assigns ids in strict topological order (children before parents)', () => {
            const x = createNode(catalog, 'x');
            const y = createNode(catalog, 'y');
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
            const x = createNode(catalog, 'x');
            const expr = createExpression(x, x, x);
            const result = lower(catalog, expr);

            expect(Object.isFrozen(result.vertices)).toBe(true);
            expect(Object.isFrozen(result.usages)).toBe(true);
            expect(result.roots).toEqual([0, 0, 0]);
            expect(result.vertices.length).toBe(1);
            expect(result.vertices[0].op).toBe('x');
            expect(result.vertices[0].context).toBe('root');
        });
    });

    describe('hash-consing / deduplication (D22)', () => {
        it('deduplicates identical sub-expressions across channels', () => {
            const x = createNode(catalog, 'x');
            const y = createNode(catalog, 'y');
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
            const x1 = createNode(catalog, 'x');
            const x2 = createNode(catalog, 'x');
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
            const x = createNode(catalog, 'x');
            const expr = createExpression(c1, c2, x);

            const result = lower(catalog, expr);

            expect(result.vertices).toHaveLength(3);
            expect(result.vertices[0].params).toEqual([0.25]);
            expect(result.vertices[1].params).toEqual([0.75]);
        });
    });

    describe('usages counting (D29)', () => {
        it('adds +1 usage per channel root', () => {
            const x = createNode(catalog, 'x');
            const y = createNode(catalog, 'y');
            const z = createNode(catalog, 'const', [], [0.5]);
            const expr = createExpression(x, y, z);

            const result = lower(catalog, expr);

            expect(result.usages[result.roots[0]]).toBe(1);
            expect(result.usages[result.roots[1]]).toBe(1);
            expect(result.usages[result.roots[2]]).toBe(1);
        });

        it('accumulates multiple root usages when channels share the same root', () => {
            const x = createNode(catalog, 'x');
            // r, g, b are all x
            const expr = createExpression(x, x, x);
            const result = lower(catalog, expr);

            expect(result.vertices).toHaveLength(1);
            expect(result.roots).toEqual([0, 0, 0]);
            // Root usage = 1 + 1 + 1 = 3
            expect(result.usages[0]).toBe(3);
        });

        it('applies operator input multiplicity to child usages', () => {
            const x = createNode(catalog, 'x');
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
            const x = createNode(catalog, 'x');
            const sinX = createNode(catalog, 'sin', [x]); // x is child of sinX
            const add1 = createNode(catalog, 'add', [sinX, x]);
            const add2 = createNode(catalog, 'add', [sinX, x]); // identical to add1!
            const y = createNode(catalog, 'y');
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
});
