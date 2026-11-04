import { describe, expect, it } from 'vite-plus/test';

import { COLOR_SPACE_IDS } from './colors';
import type { ColorSpaceId } from './colors';
import { compile } from './emit';
import { evaluate } from './evaluate';
import { generate } from './generate';
import { createGrammar, grammarRegistry } from './grammar';
import type { Point } from './ops';
import { usesTime } from './tree';
import type { Expression } from './tree';

/** Property matrix: every size, every color space, a spread of seeds. */
const SEEDS = [0, 1, 2, 7, 42, 99] as const;
const CHANNELS = ['r', 'g', 'b'] as const;

/** Deterministic probes covering the corners and the interior of [-1, 1]², at several phases. */
const PROBE_POINTS: readonly Point[] = [-1, 0, 1].flatMap((x) =>
    [-1, 0, 0.63].map((y) => ({ x, y, phase: (x + y + 2) / 4 })),
);

interface Sample {
    readonly label: string;
    readonly space: ColorSpaceId;
    readonly expression: Expression;
}

function drawSamples(): readonly Sample[] {
    const samples: Sample[] = [];

    const grammars = [
        createGrammar({
            weights: grammarRegistry.default.weights,
            minDepth: 1,
            maxDepth: 3,
            maxNodes: 12,
            shareDepth: 1,
        }),
        createGrammar({
            weights: grammarRegistry.default.weights,
            minDepth: 2,
            maxDepth: 5,
            maxNodes: 25,
            shareDepth: 2,
        }),
        createGrammar({
            weights: grammarRegistry.default.weights,
            minDepth: 3,
            maxDepth: 7,
            maxNodes: 50,
            shareDepth: 3,
        }),
    ];

    for (const grammar of grammars) {
        for (const space of COLOR_SPACE_IDS) {
            for (const seed of SEEDS) {
                samples.push({
                    label: `${grammar.minDepth}/${grammar.maxDepth}/${grammar.maxNodes}/${space}/seed ${seed}`,
                    space,
                    expression: generate(grammar, seed),
                });
            }
        }
    }

    return samples;
}

describe('compile', () => {
    it('emits a well-formed shader for every size, space and seed', () => {
        for (const { label, space, expression } of drawSamples()) {
            const compiled = compile(expression, { space });

            expect(compiled.source, label).toMatch(/^#version 300 es\n/);
            expect(compiled.source, label).toContain('void main()');
            expect(compiled.source, label).toContain(`ra_${space}(vec3(`);
            expect(compiled.source, label).not.toMatch(/undefined|NaN|Infinity/);
            expect(compiled.stats.sourceLength, label).toBe(compiled.source.length);
            expect(compiled.stats.nodes, label).toBeGreaterThan(0);
            expect(compiled.animated, label).toBe(usesTime(expression));
        }
    });

    it('keeps every evaluated channel finite and inside [-1, 1]', () => {
        for (const { label, expression } of drawSamples()) {
            for (const point of PROBE_POINTS) {
                const rgb = evaluate(expression, point);

                for (const channel of CHANNELS) {
                    const value = rgb[channel];
                    const at = `${label} at (${point.x}, ${point.y}, ${point.phase}) ${channel}=${value}`;

                    expect(Number.isFinite(value), at).toBe(true);
                    expect(value, at).toBeGreaterThanOrEqual(-1);
                    expect(value, at).toBeLessThanOrEqual(1);
                }
            }
        }
    });
});
