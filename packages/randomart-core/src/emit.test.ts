import { describe, expect, it } from 'vite-plus/test';

import { COLOR_SPACE_IDS } from './colors';
import type { ColorSpaceId } from './colors';
import { compile } from './emit';
import { generate } from './generate';
import { lower } from './lower';
import { SEEDS, seedOf, SIZE_GRAMMARS } from './testing/fixtures';
import { createNode, usesTime } from './tree';
import type { Expression } from './tree';

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
    it('emits a Shadertoy shader for every size, space and seed', () => {
        for (const { label, space, expression } of drawSamples()) {
            const compiled = compile(expression, { space });
            const { source } = compiled;
            const animated = usesTime(expression);

            expect(source, label).toContain(
                'void mainImage(out vec4 fragColor, in vec2 fragCoord)',
            );
            expect(source, label).toContain('vec2 v_p = fragCoord / iResolution.xy * 2.0 - 1.0;');
            expect(source, label).toContain(`ra_${space}(vec3(`);
            expect(source, label).toContain('fragColor = vec4(');
            expect(source, label).not.toMatch(/^#version/m);
            expect(source, label).not.toMatch(/\buniform\s/);
            expect(source, label).not.toContain('out vec4 o_color');
            expect(source, label).not.toContain('void main()');
            expect(source, label).not.toMatch(/undefined|NaN|Infinity/);
            expect(compiled.stats.sourceLength, label).toBe(source.length);
            expect(compiled.stats.vertices, label).toBeGreaterThan(0);
            expect(compiled.animated, label).toBe(animated);

            if (animated) {
                expect(source, label).toContain('float ra_phase()');
                expect(source, label).toContain('float u_phase = ra_phase();');
                expect(source, label).toContain('iTime');
            } else {
                expect(source, label).not.toContain('ra_phase(');
                expect(source, label).not.toContain('iTime');
                expect(source, label).not.toContain('u_phase');
            }
        }
    });

    it('omits the time hook for a static expression', () => {
        const constant = createNode('const', [], { value: 0.5 });
        const compiled = compile({ r: constant, g: constant, b: constant }, { space: 'srgb' });

        expect(compiled.animated).toBe(false);
        expect(compiled.source).not.toContain('ra_phase');
        expect(compiled.source).not.toContain('iTime');
    });

    describe('stats coherence', () => {
        it('vertices + contexts equals the lowered DAG step count (features.dagNodes)', () => {
            for (const grammar of SIZE_GRAMMARS) {
                for (const space of COLOR_SPACE_IDS) {
                    for (const seed of SEEDS) {
                        const expression = generate(grammar, seedOf(seed));
                        const compiled = compile(expression, { space });
                        const { steps } = lower(expression);

                        // features.dagNodes (in randomart-taste) counts steps.length = vertices + contexts.
                        expect(
                            compiled.stats.vertices + compiled.stats.contexts,
                            `${grammar.minDepth}/${space}/seed ${seed}`,
                        ).toBe(steps.length);
                    }
                }
            }
        });
    });
});
