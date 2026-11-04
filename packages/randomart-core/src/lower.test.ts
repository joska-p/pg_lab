import { describe, expect, it } from 'vite-plus/test';

import { lower } from './lower';
import type { LoweredVertex, LoweringStep } from './lower';
import { createExpression, createNode } from './tree';

function xNode(amp = 0, phase = 0, cycles = 1) {
    return createNode('x', [], { amp, phase, cycles });
}

function constNode(value: number) {
    return createNode('const', [], { value });
}

function vertexSteps(steps: readonly LoweringStep[]): LoweredVertex[] {
    const result: LoweredVertex[] = [];
    for (const step of steps) {
        if (step.kind === 'vertex') {
            result.push(step.vertex);
        }
    }
    return result;
}

describe('lower', () => {
    it('shares a single vertex for two identical subtrees and counts two usages', () => {
        const x1 = xNode();
        const x2 = xNode(); // structurally identical to x1
        const add = createNode('add', [x1, x2]);
        const zero = constNode(0);
        const expr = createExpression(add, zero, zero);

        const { steps, usages } = lower(expr);

        const xVertices = vertexSteps(steps).filter((v) => v.op === 'x');
        expect(xVertices).toHaveLength(1);
        expect(usages.get(xVertices[0].id)).toBe(2);
    });

    it('creates two distinct vertices for the same op with different params', () => {
        const x1 = xNode(0.1, 0, 1);
        const x2 = xNode(0.2, 0, 1);
        const add = createNode('add', [x1, x2]);
        const expr = createExpression(add, constNode(0), constNode(0));

        const { steps, usages } = lower(expr);

        const xVertices = vertexSteps(steps).filter((v) => v.op === 'x');
        expect(xVertices).toHaveLength(2);
        expect(xVertices[0].params.amp).toBe(0.1);
        expect(xVertices[1].params.amp).toBe(0.2);
        expect(usages.get(xVertices[0].id)).toBe(1);
        expect(usages.get(xVertices[1].id)).toBe(1);
    });

    it('creates two distinct vertices for the same x in two different warp contexts', () => {
        const x = xNode();
        const warp1 = createNode('warp', [constNode(0), constNode(0), x]);
        const warp2 = createNode('warp', [constNode(0.1), constNode(0), x]); // different dx => different context
        const expr = createExpression(warp1, warp2, constNode(0));

        const { steps } = lower(expr);

        const xVertices = vertexSteps(steps).filter((v) => v.op === 'x');
        expect(xVertices).toHaveLength(2);
        expect(xVertices[0].context).not.toBe(xVertices[1].context);
    });

    it('creates a single context for two identical warps', () => {
        const x = xNode();
        const warp1 = createNode('warp', [constNode(0), constNode(0), x]);
        const warp2 = createNode('warp', [constNode(0), constNode(0), x]); // identical
        const expr = createExpression(warp1, warp2, constNode(0));

        const { steps } = lower(expr);

        const contexts = steps.filter((s) => s.kind === 'context');
        expect(contexts).toHaveLength(1);
    });

    it('emits steps in topological order: inputs always precede their vertex', () => {
        const x = xNode();
        const add = createNode('add', [x, x]);
        const warp = createNode('warp', [constNode(0), constNode(0), add]);
        const expr = createExpression(warp, constNode(0), constNode(0));

        const { steps } = lower(expr);

        const emitted = new Set<number>();
        for (const step of steps) {
            if (step.kind === 'vertex') {
                for (const input of step.vertex.inputs) {
                    expect(emitted.has(input)).toBe(true);
                }
                emitted.add(step.vertex.id);
            } else {
                for (const input of step.context.inputs) {
                    expect(emitted.has(input)).toBe(true);
                }
                emitted.add(step.context.id);
            }
        }
    });

    it('counts roots as usages: the same node as r, g, b has three usages', () => {
        const x = xNode();
        const expr = createExpression(x, x, x);

        const { roots, usages } = lower(expr);

        expect(roots[0]).toBe(roots[1]);
        expect(roots[1]).toBe(roots[2]);
        expect(usages.get(roots[0])).toBe(3);
    });

    it('sets the parent of a nested context to the enclosing context', () => {
        const x = xNode();
        const innerWarp = createNode('warp', [constNode(0), constNode(0), x]);
        const outerWarp = createNode('warp', [constNode(0), constNode(0), innerWarp]);
        const expr = createExpression(outerWarp, constNode(0), constNode(0));

        const { steps } = lower(expr);

        const contexts = steps.filter((s) => s.kind === 'context').map((s) => s.context);
        expect(contexts).toHaveLength(2);
        expect(contexts[0].parent).toBe(0); // outer warp sits in the root context
        expect(contexts[1].parent).toBe(contexts[0].id); // inner warp sits in the outer context
    });
});
