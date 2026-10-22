import { describe, expect, it } from 'vite-plus/test';

import { deserializeGrammar, serializeGrammar } from '../artwork/serialize';
import { createDefaultCatalog } from '../catalog/Catalog';
import { compile } from '../compiler/compile';
import { CONFIG } from '../config/config';
import { nodeCount } from '../expression/expression';
import { generate } from '../generator/generator';
import { channelModelOf, constraintsOf, createGrammar } from '../grammar/grammar';
import { GRAMMAR_PRESETS } from '../grammar/presets';
import { createSeed } from '../random/seed';
import { colorSpaceIds } from './registry';

const catalog = createDefaultCatalog();
const SIZE = 'medium' as const;
const MAX_DEPTH = constraintsOf(SIZE).maxDepth;

/** Full-catalog weights, so a shared trunk still produces a rich, non-degenerate tree. */
function fullWeights(): Record<string, number> {
    return Object.fromEntries(catalog.operators().map((operator) => [operator.name, 1]));
}

describe('channel model', () => {
    it('defaultGrammar shares a shallow trunk read as OKLCH', () => {
        expect(channelModelOf(GRAMMAR_PRESETS[0].grammar)).toEqual(CONFIG.channels);
    });

    it('refuses an unknown color space (content, not a repair)', () => {
        expect(() =>
            createGrammar({
                weights: { x: 1, add: 1 },
                size: SIZE,
                shareDepth: 0,
                space: 'nope' as never,
            }),
        ).toThrow(/unknown color space/);
    });

    it('keeps every declared color space usable', () => {
        for (const space of colorSpaceIds) {
            const grammar = createGrammar({
                weights: { x: 1, add: 1 },
                size: SIZE,
                shareDepth: 1,
                space,
            });

            expect(channelModelOf(grammar)).toEqual({ space, shareDepth: 1 });
        }
    });

    it('repairs shareDepth instead of refusing it (an editing quantity)', () => {
        const shareDepth = (value: number): number =>
            createGrammar({
                weights: { x: 1, add: 1 },
                size: SIZE,
                shareDepth: value,
                space: 'srgb',
            }).shareDepth;

        expect(shareDepth(-3)).toBe(0); // clamped up
        expect(shareDepth(99)).toBe(MAX_DEPTH); // clamped down to the profile's maxDepth
        expect(shareDepth(2.7)).toBe(3); // rounded
        expect(shareDepth(Number.NaN)).toBe(CONFIG.channels.shareDepth); // non-finite → default
    });
});

describe('generator channels', () => {
    it('shareDepth 0: three independent trees', () => {
        const grammar = createGrammar({
            weights: fullWeights(),
            size: SIZE,
            shareDepth: 0,
            space: 'srgb',
        });

        const expression = generate(grammar, createSeed(7));

        expect(expression.r).not.toBe(expression.g);
        expect(expression.g).not.toBe(expression.b);
    });

    it('a shallow trunk: the channels agree at the root, then diverge below it', () => {
        const grammar = createGrammar({
            weights: fullWeights(),
            size: SIZE,
            shareDepth: 2,
            space: 'oklch',
        });

        const expression = generate(grammar, createSeed(7));

        // Same operator and params at the shared root — that is the correlation …
        expect(expression.r.operatorName).toBe(expression.g.operatorName);
        expect(expression.r.params).toEqual(expression.g.params);
        // … but the nodes are distinct, since the channels diverge below the trunk.
        expect(expression.r).not.toBe(expression.g);
    });

    it('shareDepth >= maxDepth: one single tree, so r = g = b', () => {
        const grammar = createGrammar({
            weights: fullWeights(),
            size: SIZE,
            shareDepth: MAX_DEPTH,
            space: 'oklch',
        });

        const expression = generate(grammar, createSeed(5));

        expect(expression.r).toBe(expression.g);
        expect(expression.g).toBe(expression.b);

        // The compiler sees one vertex per node, not three (the tree really is shared).
        const compiled = compile(catalog, expression);
        expect(compiled.stats.vertices).toBe(nodeCount(expression.r));
        expect(compiled.stats.nodes).toBe(3 * nodeCount(expression.r));
    });
});

describe('compile channels', () => {
    const expression = generate(
        createGrammar({
            weights: { x: 1, y: 1, const: 1, neg: 1 },
            size: 'small',
            shareDepth: 0,
            space: 'srgb',
        }),
        createSeed(1),
    );

    it('applies the color space conversion once, at the end of main', () => {
        const srgb = compile(catalog, expression, {
            channels: { space: 'srgb', shareDepth: 0 },
        });

        expect(srgb.source).toContain('vec3 ra_srgb(vec3 raw)');
        expect(srgb.source).toContain('o_color = vec4(ra_srgb(vec3(');
        expect(srgb.source.match(/o_color =/g)).toHaveLength(1);
    });

    it('picks the conversion of the requested space', () => {
        for (const space of colorSpaceIds) {
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
    it('round-trips the grammar axes', () => {
        const grammar = GRAMMAR_PRESETS[0].grammar;
        const data = serializeGrammar(grammar);

        expect(data.space).toBe(CONFIG.channels.space);
        expect(data.shareDepth).toBe(CONFIG.channels.shareDepth);
        expect(serializeGrammar(deserializeGrammar(data))).toEqual(data);
    });

    it('requires every axis (there is no channel fallback in a grammar)', () => {
        expect(() =>
            deserializeGrammar({
                weights: { x: 1, add: 1 },
                size: SIZE,
                shareDepth: 0,
            }),
        ).toThrow(/grammar\.space: unknown color space/);
        expect(() =>
            deserializeGrammar({
                weights: { x: 1, add: 1 },
                size: SIZE,
                space: 'oklch',
            }),
        ).toThrow(/grammar\.shareDepth: number expected/);
        expect(() =>
            deserializeGrammar({
                weights: { x: 1, add: 1 },
                shareDepth: 0,
                space: 'oklch',
            }),
        ).toThrow(/grammar\.size: unknown size profile/);
    });

    it('repairs shareDepth against the maxDepth of the size profile', () => {
        const grammar = deserializeGrammar({
            weights: { x: 1, add: 1 },
            size: 'small',
            shareDepth: 99,
            space: 'oklab',
        });

        expect(grammar.shareDepth).toBe(5);
        expect(grammar.space).toBe('oklab');
    });

    it('refuses a malformed channel field with the field path', () => {
        const base = {
            weights: { x: 1, add: 1 },
            size: SIZE,
            shareDepth: 0,
            space: 'srgb',
        };

        expect(() => deserializeGrammar({ ...base, space: 'nope' })).toThrow(
            /grammar\.space: unknown color space/,
        );
        expect(() => deserializeGrammar({ ...base, shareDepth: Number.NaN })).toThrow(
            /grammar\.shareDepth: finite number expected/,
        );
        expect(() =>
            deserializeGrammar({
                ...base,
                channels: { space: 'srgb', shareDepth: 0 },
            }),
        ).toThrow(/grammar\.channels: unknown field/);
    });
});
