import { generate } from '@repo/randomart-core/generate';
import { GRAMMAR_PRESETS, vocabulary } from '@repo/randomart-core/grammar';
import { isOpName } from '@repo/randomart-core/ops';
import { createSeed } from '@repo/randomart-core/seed';
import { createExpression, createNode, usesTime } from '@repo/randomart-core/tree';
import { describe, expect, it } from 'vite-plus/test';

import { countOf, featuresOf } from './features';

function xNode(amp = 0, cycles = 1) {
    return createNode('x', [], { amp, phase: 0, cycles });
}

function yNode(amp = 0, cycles = 1) {
    return createNode('y', [], { amp, phase: 0, cycles });
}

function constNode(value: number) {
    return createNode('const', [], { value });
}

describe('featuresOf counts', () => {
    it('counts a shared subtree once', () => {
        const x = xNode();
        const add = createNode('add', [x, x]);
        const features = featuresOf(createExpression(add, add, add), 'srgb');

        expect(countOf(features, 'add')).toBe(1);
        expect(countOf(features, 'x')).toBe(1);
        expect(countOf(features, 'y')).toBe(0);
        expect(features.dagNodes).toBe(2);
        expect(features.treeNodes).toBe(3);
        expect(features.depth).toBe(2);
    });

    it('counts a warp as a context, with its body in the inner frame', () => {
        const warp = createNode('warp', [constNode(0), constNode(0), xNode()]);
        const features = featuresOf(createExpression(warp, warp, warp), 'srgb');

        expect(countOf(features, 'warp')).toBe(1);
        expect(countOf(features, 'const')).toBe(1);
        expect(countOf(features, 'x')).toBe(1);
        expect(features.dagNodes).toBe(3);
        expect(features.treeNodes).toBe(4);
    });
});

describe('featuresOf sharing', () => {
    it('reports the full depth for a mono expression', () => {
        const tree = createNode('add', [xNode(), yNode()]);
        const features = featuresOf(createExpression(tree, tree, tree), 'srgb');

        expect(features.mono).toBe(true);
        expect(features.sharedDepth).toBe(2);
    });

    it('reports 0 when the roots differ', () => {
        const r = createNode('sin', [xNode()]);
        const g = createNode('cos', [xNode()]);
        const b = createNode('abs', [xNode()]);

        expect(featuresOf(createExpression(r, g, b), 'srgb').sharedDepth).toBe(0);
    });

    it('stops at the level where the channels diverge', () => {
        const low = createNode('add', [xNode(0.1), yNode()]);
        const high = createNode('add', [xNode(0.2), yNode()]);
        const features = featuresOf(createExpression(low, high, low), 'srgb');

        expect(features.mono).toBe(false);
        expect(features.depth).toBe(2);
        expect(features.sharedDepth).toBe(1);
    });
});

describe('featuresOf modulation and passthrough', () => {
    it('averages amp and cycles over modulated terminals only', () => {
        const tree = createNode('add', [
            createNode('add', [xNode(0.5, 2), yNode(0.3, 4)]),
            xNode(0, 3),
        ]);
        const { modulation } = featuresOf(createExpression(tree, tree, tree), 'srgb');

        expect(modulation.count).toBe(2);
        expect(modulation.meanAmp).toBeCloseTo(0.4);
        expect(modulation.meanCycles).toBeCloseTo(3);
    });

    it('is all zero without modulation, and not animated', () => {
        const features = featuresOf(createExpression(xNode(), xNode(), xNode()), 'srgb');

        expect(features.modulation).toEqual({ count: 0, meanAmp: 0, meanCycles: 0 });
        expect(features.animated).toBe(false);
    });

    it('passes the color space through and detects animation', () => {
        const x = xNode(0.5);
        const features = featuresOf(createExpression(x, x, x), 'oklch');

        expect(features.space).toBe('oklch');
        expect(features.animated).toBe(true);
    });
});

describe('featuresOf on generated expressions', () => {
    it('agrees with the grammar that drew the expression', () => {
        for (const preset of GRAMMAR_PRESETS) {
            const { grammar } = preset;
            const enabled = new Set(vocabulary(grammar));

            for (const seed of [0, 1, 2, 42]) {
                const expression = generate(grammar, createSeed(String(seed)));
                const features = featuresOf(expression, grammar.space);
                const total = Object.values(features.operatorCounts).reduce(
                    (sum, count) => sum + count,
                    0,
                );

                expect(features.treeNodes).toBeLessThanOrEqual(grammar.maxNodes);
                expect(features.depth).toBeGreaterThanOrEqual(grammar.minDepth);
                expect(features.depth).toBeLessThanOrEqual(grammar.maxDepth);
                expect(features.sharedDepth).toBeGreaterThanOrEqual(
                    Math.min(grammar.shareDepth, features.depth),
                );
                expect(features.animated).toBe(usesTime(expression));
                expect(total).toBe(features.dagNodes);

                for (const name of Object.keys(features.operatorCounts)) {
                    expect(isOpName(name) && enabled.has(name), name).toBe(true);
                }
            }
        }
    });
});
