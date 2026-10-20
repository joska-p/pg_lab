import { describe, expect, it } from 'vite-plus/test';

import { Catalog, createDefaultCatalog } from '../catalog/Catalog';
import { DEPENDENCIES } from '../catalog/dependencies';
import { OPERATOR_SPECS } from '../catalog/operators/registry';
import type { OperatorSpec } from '../catalog/operators/types';
import { createExpression, createNode } from '../expression/expression';
import { emit } from './emit';
import { lower } from './lower';

describe('emit', () => {
    const catalog = createDefaultCatalog();

    // r = sin(x), g = add(sin(x), y), b = const(0.5)
    // Vertex ids: x = 0, sin(x) = 1, y = 2, add = 3, const = 4. sin(x) has 2 usages.
    const x = createNode(catalog, 'x', [], [0, 0, 0]);
    const y = createNode(catalog, 'y', [], [0, 0, 0]);
    const sinX = createNode(catalog, 'sin', [x]);
    const add = createNode(catalog, 'add', [sinX, y]);
    const konst = createNode(catalog, 'const', [], [0.5]);
    const shared = lower(catalog, createExpression(sinX, add, konst));

    it("'shared' names only the vertex used twice, and keeps atoms inline", () => {
        const result = emit(catalog, shared, 'shared');

        expect(result.lines).toEqual(['  float v1 = sin(PI*v_p.x);']);
        expect(result.varCount).toBe(1);
        expect(result.channelTexts[0]).toBe('v1');
        expect(result.channelTexts[1]).toContain('v1');
        expect(result.channelTexts[2]).toContain('0.5');
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
        // A custom operator that reads `u_phase` proves uniform-dep collection: only the uniforms
        // an emitted operator declares reach the preamble (the stock `x`/`y` read `u_phase` too).
        const clockOperator: OperatorSpec = {
            label: 'Clock',
            group: 'terminal',
            requires: ['u_phase'],
            glsl: () => 'sin(2.0*PI*u_phase)',
        };
        const clockCatalog = new Catalog({ ...OPERATOR_SPECS, clock: clockOperator }, DEPENDENCIES);
        const clockNode = createNode(clockCatalog, 'clock');
        const xn = createNode(clockCatalog, 'x', [], [0, 0, 0]);
        const clocked = lower(clockCatalog, createExpression(clockNode, xn, xn));

        expect(emit(clockCatalog, clocked, 'shared').usedDeps.has('u_phase')).toBe(true);

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
