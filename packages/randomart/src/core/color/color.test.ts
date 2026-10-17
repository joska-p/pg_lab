import { describe, expect, it } from 'vite-plus/test';

import { deserializeGrammar, serializeGrammar } from '../artwork/index.ts';
import { createDefaultCatalog } from '../catalog/index.ts';
import { compile } from '../compiler/index.ts';
import { generate } from '../generator/index.ts';
import { createGrammar, defaultGrammar, randomizeWeights } from '../grammar/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import { DEFAULT_COLOR, PALETTE_IDS, UNRELATED_COLOR } from './index.ts';

const catalog = createDefaultCatalog();

/** Full-catalog weights, so an unrelated grammar still produces three rich, distinct trees. */
function fullWeights(): Record<string, number> {
    return Object.fromEntries(catalog.operators().map((operator) => [operator.name, 1]));
}

describe('color model', () => {
    it('defaults to the unrelated model when the caller says nothing', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1, y: 1 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
        });

        expect(grammar.color).toEqual(UNRELATED_COLOR);
    });

    it('defaultGrammar is correlated through a palette', () => {
        expect(defaultGrammar(catalog).color).toEqual(DEFAULT_COLOR);
    });

    it('refuses an unknown palette (content, not a repair)', () => {
        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
                color: { kind: 'correlated', palette: 'nope' as never },
            }),
        ).toThrow(/unknown palette/);
    });

    it('keeps every declared palette usable', () => {
        for (const palette of PALETTE_IDS) {
            const grammar = createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
                color: { kind: 'correlated', palette },
            });

            expect(grammar.color).toEqual({ kind: 'correlated', palette });
        }
    });
});

describe('generator colour', () => {
    it('correlated: the three channels are the same field (one shared node)', () => {
        const grammar = createGrammar(catalog, {
            weights: fullWeights(),
            constraints: { minDepth: 2, maxDepth: 5, maxNodes: 40 },
            color: { kind: 'correlated', palette: 'spectrum' },
        });

        const expression = generate(catalog, grammar, createSeed(7));

        expect(expression.r).toBe(expression.g);
        expect(expression.g).toBe(expression.b);
    });

    it('unrelated: the three channels are independent trees', () => {
        const grammar = createGrammar(catalog, {
            weights: fullWeights(),
            constraints: { minDepth: 2, maxDepth: 5, maxNodes: 40 },
        });

        const expression = generate(catalog, grammar, createSeed(7));

        expect(expression.r).not.toBe(expression.g);
    });

    it('randomizeWeights preserves the colour model', () => {
        const grammar = createGrammar(catalog, {
            weights: fullWeights(),
            constraints: { minDepth: 2, maxDepth: 5, maxNodes: 40 },
            color: { kind: 'correlated', palette: 'ember' },
        });

        const randomized = randomizeWeights(catalog, grammar, createRng(createSeed(11)));

        expect(randomized.color).toEqual({ kind: 'correlated', palette: 'ember' });
    });
});

describe('compile colour', () => {
    it('correlated: samples the palette, no raw vec3 rgb', () => {
        const expression = generate(
            catalog,
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 1, maxNodes: 1 },
            }),
            createSeed(1),
        );

        const compiled = compile(catalog, expression, {
            color: { kind: 'correlated', palette: 'spectrum' },
        });

        expect(compiled.source).toContain('vec3 ra_pal(float t)');
        expect(compiled.source).toContain('o_color = vec4(ra_pal(t), 1.0);');
        expect(compiled.source).not.toContain('vec3 rgb =');
    });

    it('unrelated: writes the channels straight to RGB', () => {
        const expression = generate(
            catalog,
            createGrammar(catalog, {
                weights: { x: 1, y: 1, const: 1 },
                constraints: { minDepth: 1, maxDepth: 2, maxNodes: 5 },
            }),
            createSeed(1),
        );

        const compiled = compile(catalog, expression, { color: { kind: 'unrelated' } });

        expect(compiled.source).toContain('vec3 rgb = vec3(');
        expect(compiled.source).not.toContain('ra_pal');
    });
});

describe('grammar colour serialization', () => {
    it('round-trips the colour model', () => {
        const grammar = defaultGrammar(catalog);
        const data = serializeGrammar(grammar);

        expect(data.color).toEqual(DEFAULT_COLOR);
        expect(deserializeGrammar(catalog, data).color).toEqual(DEFAULT_COLOR);
    });

    it('accepts a missing colour (falls back to unrelated)', () => {
        const grammar = deserializeGrammar(catalog, {
            weights: { x: 1 },
            constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
        });

        expect(grammar.color).toEqual(UNRELATED_COLOR);
    });

    it('refuses a malformed colour with the field path', () => {
        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
                color: { kind: 'correlated', palette: 'nope' },
            }),
        ).toThrow(/grammar\.color\.palette: unknown palette/);

        expect(() =>
            deserializeGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
                color: { kind: 'wat' },
            }),
        ).toThrow(/grammar\.color\.kind: unknown color model/);
    });
});
