import { describe, expect, it } from 'vite-plus/test';

import { deserializeGrammar, serializeGrammar } from '../artwork/index.ts';
import { createDefaultCatalog } from '../catalog/index.ts';
import { compile } from '../compiler/index.ts';
import { CONFIG } from '../config/index.ts';
import { nodeCount } from '../expression/index.ts';
import { generate } from '../generator/index.ts';
import { createGrammar, defaultGrammar, randomizeWeights } from '../grammar/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import { COLOR_SPACE_IDS, DEFAULT_CHANNELS, RAW_CHANNELS } from './index.ts';

const catalog = createDefaultCatalog();

/** Full-catalog weights, so a shared trunk still produces a rich, non-degenerate tree. */
function fullWeights(): Record<string, number> {
    return Object.fromEntries(catalog.operators().map((operator) => [operator.name, 1]));
}

const SHARED = { minDepth: 2, maxDepth: 6, maxNodes: 40 };

describe('channel model', () => {
    it('defaults to raw sRGB, three independent channels, when the caller says nothing', () => {
        const grammar = createGrammar(catalog, {
            weights: { x: 1, y: 1 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
        });

        expect(grammar.channels).toEqual(RAW_CHANNELS);
    });

    it('defaultGrammar shares a shallow trunk read as OKLCH', () => {
        expect(defaultGrammar(catalog).channels).toEqual(DEFAULT_CHANNELS);
    });

    it('refuses an unknown colour space (content, not a repair)', () => {
        expect(() =>
            createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
                channels: { space: 'nope' as never, shareDepth: 0 },
            }),
        ).toThrow(/unknown colour space/);
    });

    it('keeps every declared colour space usable', () => {
        for (const space of COLOR_SPACE_IDS) {
            const grammar = createGrammar(catalog, {
                weights: { x: 1 },
                constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
                channels: { space, shareDepth: 1 },
            });

            expect(grammar.channels).toEqual({ space, shareDepth: 1 });
        }
    });

    it('repairs shareDepth instead of refusing it (an editing quantity)', () => {
        const channels = (shareDepth: number): number =>
            createGrammar(catalog, {
                weights: { x: 1, add: 1 },
                constraints: { minDepth: 1, maxDepth: 5, maxNodes: 20 },
                channels: { space: 'srgb', shareDepth },
            }).channels.shareDepth;

        expect(channels(-3)).toBe(0); // clamped up
        expect(channels(9)).toBe(5); // clamped down to maxDepth
        expect(channels(2.7)).toBe(3); // rounded
        expect(channels(Number.NaN)).toBe(CONFIG.channels.shareDepth); // non-finite → the concept's default
    });
});

describe('generator channels', () => {
    it('shareDepth 0: three independent trees', () => {
        const grammar = createGrammar(catalog, {
            weights: fullWeights(),
            constraints: SHARED,
            channels: { space: 'srgb', shareDepth: 0 },
        });

        const expression = generate(catalog, grammar, createSeed(7));

        expect(expression.r).not.toBe(expression.g);
        expect(expression.g).not.toBe(expression.b);
    });

    it('a shallow trunk: the channels agree at the root, then diverge below it', () => {
        const grammar = createGrammar(catalog, {
            weights: fullWeights(),
            constraints: SHARED,
            channels: { space: 'oklch', shareDepth: 2 },
        });

        const expression = generate(catalog, grammar, createSeed(7));

        // Same operator and params at the shared root — that is the correlation …
        expect(expression.r.operatorName).toBe(expression.g.operatorName);
        expect(expression.r.params).toEqual(expression.g.params);
        // … but the nodes are distinct, since the channels diverge below the trunk.
        expect(expression.r).not.toBe(expression.g);
    });

    it('shareDepth >= maxDepth: one single tree, so r = g = b', () => {
        const grammar = createGrammar(catalog, {
            weights: fullWeights(),
            constraints: SHARED,
            channels: { space: 'oklch', shareDepth: SHARED.maxDepth },
        });

        const expression = generate(catalog, grammar, createSeed(5));

        expect(expression.r).toBe(expression.g);
        expect(expression.g).toBe(expression.b);

        // The compiler sees one vertex per node, not three (the tree really is shared).
        const compiled = compile(catalog, expression);
        expect(compiled.stats.vertices).toBe(nodeCount(expression.r));
        expect(compiled.stats.nodes).toBe(3 * nodeCount(expression.r));
    });

    it('randomizeWeights preserves the channel model', () => {
        const grammar = createGrammar(catalog, {
            weights: fullWeights(),
            constraints: SHARED,
            channels: { space: 'hsl', shareDepth: 2 },
        });

        const randomized = randomizeWeights(catalog, grammar, createRng(createSeed(11)));

        expect(randomized.channels).toEqual({ space: 'hsl', shareDepth: 2 });
    });
});

describe('compile channels', () => {
    const expression = generate(
        catalog,
        createGrammar(catalog, {
            weights: { x: 1, y: 1, const: 1 },
            constraints: { minDepth: 1, maxDepth: 2, maxNodes: 5 },
        }),
        createSeed(1),
    );

    it('applies the colour space conversion once, at the end of main', () => {
        const srgb = compile(catalog, expression, {
            channels: { space: 'srgb', shareDepth: 0 },
        });

        expect(srgb.source).toContain('vec3 ra_srgb(vec3 raw)');
        expect(srgb.source).toContain('o_color = vec4(ra_srgb(vec3(');
        expect(srgb.source.match(/o_color =/g)).toHaveLength(1);
    });

    it('picks the conversion of the requested space', () => {
        for (const space of COLOR_SPACE_IDS) {
            const compiled = compile(catalog, expression, {
                channels: { space, shareDepth: 0 },
            });

            expect(compiled.source).toContain('o_color = vec4(ra_');
            expect(compiled.source).toContain(`vec3 ra_${space}(vec3 raw)`);
        }
    });

    it('ignores shareDepth (a generator concern, not an emission one)', () => {
        const a = compile(catalog, expression, { channels: { space: 'oklch', shareDepth: 0 } });
        const b = compile(catalog, expression, {
            channels: { space: 'oklch', shareDepth: 5 },
        });

        expect(a.source).toBe(b.source);
    });
});

describe('channel serialization', () => {
    it('round-trips the channel model', () => {
        const grammar = defaultGrammar(catalog);
        const data = serializeGrammar(grammar);

        expect(data.channels).toEqual(DEFAULT_CHANNELS);
        expect(deserializeGrammar(catalog, data).channels).toEqual(DEFAULT_CHANNELS);
    });

    it('accepts a missing channel model (falls back to raw sRGB)', () => {
        const grammar = deserializeGrammar(catalog, {
            weights: { x: 1 },
            constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
        });

        expect(grammar.channels).toEqual(RAW_CHANNELS);
    });

    it('repairs shareDepth against the maxDepth in the file', () => {
        const grammar = deserializeGrammar(catalog, {
            weights: { x: 1, add: 1 },
            constraints: { minDepth: 1, maxDepth: 4, maxNodes: 20 },
            channels: { space: 'oklab', shareDepth: 99 },
        });

        expect(grammar.channels).toEqual({ space: 'oklab', shareDepth: 4 });
    });

    it('refuses a malformed channel model with the field path', () => {
        const base = {
            weights: { x: 1 },
            constraints: { minDepth: 1, maxDepth: 2, maxNodes: 2 },
        };

        expect(() => deserializeGrammar(catalog, { ...base, channels: 42 })).toThrow(
            /grammar\.channels: object expected/,
        );
        expect(() =>
            deserializeGrammar(catalog, { ...base, channels: { space: 'nope', shareDepth: 0 } }),
        ).toThrow(/grammar\.channels\.space: unknown colour space/);
        expect(() =>
            deserializeGrammar(catalog, { ...base, channels: { space: 'srgb', shareDepth: 'a' } }),
        ).toThrow(/grammar\.channels\.shareDepth: number expected/);
        expect(() =>
            deserializeGrammar(catalog, {
                ...base,
                channels: { space: 'srgb', shareDepth: 0, palette: 'spectrum' },
            }),
        ).toThrow(/grammar\.channels\.palette: unknown field/);
    });
});
