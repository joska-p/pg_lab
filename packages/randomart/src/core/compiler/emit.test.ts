import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import { emit } from './emit.ts';
import { lower } from './lower.ts';

describe('emit', () => {
    const catalog = createDefaultCatalog();

    // r = sin(x), g = add(sin(x), y), b = tsin
    // Vertex ids: x = 0, sin(x) = 1, y = 2, add = 3, tsin = 4. sin(x) has 2 usages.
    const x = createNode(catalog, 'x');
    const y = createNode(catalog, 'y');
    const sinX = createNode(catalog, 'sin', [x]);
    const add = createNode(catalog, 'add', [sinX, y]);
    const tsin = createNode(catalog, 'tsin');
    const shared = lower(catalog, createExpression(sinX, add, tsin));

    it("'shared' names only the vertex used twice, and keeps atoms inline", () => {
        const result = emit(catalog, shared, 'shared');

        expect(result.lines).toEqual(['  float v1 = sin(PI*v_p.x);']);
        expect(result.varCount).toBe(1);
        expect(result.channelTexts[0]).toBe('v1');
        expect(result.channelTexts[1]).toContain('v1');
        expect(result.channelTexts[2]).toContain('sin(2.0*PI*u_phase)');
    });

    it("'none' emits no variable and recopies the shared vertex", () => {
        const result = emit(catalog, shared, 'none');

        expect(result.lines).toEqual([]);
        expect(result.varCount).toBe(0);
        expect(result.channelTexts[0]).toContain('sin(PI*v_p.x)');
        expect(result.channelTexts[1]).toContain('sin(PI*v_p.x)');
    });

    it("'all' names every vertex, atoms included", () => {
        const result = emit(catalog, shared, 'all');

        expect(result.varCount).toBe(shared.vertices.length);
        expect(result.lines).toHaveLength(shared.vertices.length);
        expect(result.lines[0]).toBe('  float v0 = v_p.x;');
    });

    it('collects the dependencies of the operators it emits', () => {
        expect(emit(catalog, shared, 'shared').usedDeps.has('u_phase')).toBe(true);

        const dx = createNode(catalog, 'const', [], [0.1]);
        const dy = createNode(catalog, 'const', [], [0.2]);
        const warp = createNode(catalog, 'warp', [dx, dy, x]);
        const warped = lower(catalog, createExpression(warp, dx, dy));

        expect(emit(catalog, warped, 'shared').usedDeps.has('ra_fold2')).toBe(true);
    });

    it('declares a coordinate context before any line that reads it', () => {
        const dx = createNode(catalog, 'const', [], [0.1]);
        const dy = createNode(catalog, 'const', [], [0.2]);
        const warp = createNode(catalog, 'warp', [dx, dy, x]);
        const warped = lower(catalog, createExpression(warp, dx, dy));
        const { lines } = emit(catalog, warped, 'all');

        const declaration = lines.findIndex((line) => line.includes('vec2 c1 ='));
        const firstUse = lines.findIndex((line) => line.includes('c1.x'));

        expect(declaration).toBeGreaterThanOrEqual(0);
        expect(firstUse).toBeGreaterThan(declaration);
    });

    it('always emits contexts, whatever the policy', () => {
        const dx = createNode(catalog, 'const', [], [0.1]);
        const dy = createNode(catalog, 'const', [], [0.2]);
        const warp = createNode(catalog, 'warp', [dx, dy, x]);
        const warped = lower(catalog, createExpression(warp, dx, dy));

        for (const policy of ['none', 'shared', 'all'] as const) {
            const { lines } = emit(catalog, warped, policy);

            expect(lines.some((line) => line.includes('vec2 c1 ='))).toBe(true);
        }
    });
});
