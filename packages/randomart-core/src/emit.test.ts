import { describe, expect, it } from 'vite-plus/test';

import { COLOR_SPACE_IDS } from './colors';
import type { ColorSpaceId } from './colors';
import { compile } from './emit';
import { generate } from './generate';
import { seedOf, SIZE_GRAMMARS } from './testing/fixtures';
import { usesTime } from './tree';
import type { Expression } from './tree';

/** Property matrix: every size, every color space, a spread of seeds. */
const SEEDS = [0, 1, 2, 7, 42, 99] as const;

interface Sample {
    readonly label: string;
    readonly space: ColorSpaceId;
    readonly expression: Expression;
}

function drawSamples(): readonly Sample[] {
    const samples: Sample[] = [];

    for (const grammar of SIZE_GRAMMARS) {
        for (const space of COLOR_SPACE_IDS) {
            for (const seed of SEEDS) {
                samples.push({
                    label: `${grammar.minDepth}/${grammar.maxDepth}/${grammar.maxNodes}/${space}/seed ${seed}`,
                    space,
                    expression: generate(grammar, seedOf(seed)),
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
});
