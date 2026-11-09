import { createGrammar, getGrammarPreset, weightOf } from '@repo/randomart-core/grammar';
import { createSeed } from '@repo/randomart-core/seed';
import { formatFormula } from '@repo/randomart-core/tree';
import { describe, expect, it } from 'vite-plus/test';

import { defined } from '../testing/defined';
import { buildArtwork, isSameDraft, recompileArtwork } from './artwork';
import { createBatcher } from './batcher';
import { withWeight } from './grammarEdits';
import { resolveIntents } from './intents';

const PRESET = getGrammarPreset('default');
const CURRENT = { grammar: PRESET.grammar, seed: createSeed('1'), space: PRESET.space };

describe('resolveIntents', () => {
    it('folds two edits from the same frame without losing either', () => {
        const { draft, errors } = resolveIntents(CURRENT, [
            (d) => ({
                ...d,
                grammar: createGrammar({ ...d.grammar, maxDepth: 6, shareDepth: 2 }),
            }),
            (d) => ({
                ...d,
                grammar: createGrammar({ ...d.grammar, weights: { ...d.grammar.weights, sin: 5 } }),
            }),
        ]);

        expect(errors).toEqual([]);
        expect(draft?.grammar.maxDepth).toBe(6);
        expect(weightOf(defined(draft?.grammar, 'draft.grammar'), 'sin')).toBe(5);
    });

    it('skips a failing producer and keeps folding the rest', () => {
        const { draft, errors } = resolveIntents(CURRENT, [
            () => {
                throw new Error('bad edit');
            },
            (d) => ({ ...d, seed: createSeed('2') }),
        ]);

        expect(errors).toHaveLength(1);
        expect(draft?.seed).toBe(createSeed('2'));
    });

    it('reports no draft when the frame is empty', () => {
        expect(resolveIntents(CURRENT, [])).toEqual({ draft: null, errors: [] });
    });
});

describe('isSameDraft', () => {
    it('considers a rebuilt grammar with identical weights the same draft', () => {
        const candidate = {
            ...CURRENT,
            grammar: withWeight(CURRENT.grammar, 'sin', weightOf(CURRENT.grammar, 'sin')),
        };
        expect(candidate.grammar).not.toBe(CURRENT.grammar);
        expect(isSameDraft(CURRENT, candidate)).toBe(true);
    });

    it('distinguishes different seeds', () => {
        expect(isSameDraft(CURRENT, { ...CURRENT, seed: createSeed('2') })).toBe(false);
    });

    it('distinguishes different sin weights', () => {
        const w = weightOf(CURRENT.grammar, 'sin');
        expect(
            isSameDraft(CURRENT, {
                ...CURRENT,
                grammar: withWeight(CURRENT.grammar, 'sin', w + 1),
            }),
        ).toBe(false);
    });

    it('distinguishes different color spaces', () => {
        const otherSpace = CURRENT.space === 'srgb' ? 'oklch' : 'srgb';
        expect(isSameDraft(CURRENT, { ...CURRENT, space: otherSpace })).toBe(false);
    });
});

describe('buildArtwork', () => {
    const formulas = (artwork: ReturnType<typeof buildArtwork>) => ({
        r: formatFormula(artwork.expression.r),
        g: formatFormula(artwork.expression.g),
        b: formatFormula(artwork.expression.b),
    });

    it('keeps the expression and changes only the shader when the space changes', () => {
        const seed = createSeed('space-test');
        const first = buildArtwork(PRESET.grammar, seed, 'srgb');
        const second = buildArtwork(PRESET.grammar, seed, 'oklch');

        expect(formulas(second)).toEqual(formulas(first));
        expect(second.shader.source).not.toBe(first.shader.source);
        expect(second.shader.source).toContain('ra_oklch(vec3(');
    });

    it('recompiles a space change without regenerating the expression', () => {
        const artwork = buildArtwork(PRESET.grammar, createSeed('recompile'), 'srgb');
        const recolored = recompileArtwork(artwork, 'oklch');

        expect(recolored.expression).toBe(artwork.expression);
        expect(recolored.space).toBe('oklch');
        expect(recolored.shader.source).not.toBe(artwork.shader.source);
    });
});

describe('createBatcher', () => {
    it('flushes one batch per tick', () => {
        const scheduled: (() => void)[] = [];
        const flushed: number[][] = [];
        const push = createBatcher<number>(
            (run) => scheduled.push(run),
            (items) => flushed.push([...items]),
        );

        push(1);
        push(2);

        expect(scheduled).toHaveLength(1);
        defined(scheduled[0], 'scheduled run')();

        expect(flushed).toEqual([[1, 2]]);
    });

    it('supports a synchronous scheduler', () => {
        const flushed: number[][] = [];
        const push = createBatcher<number>(
            (run) => run(),
            (items) => flushed.push([...items]),
        );

        push(1);
        push(2);

        expect(flushed).toEqual([[1], [2]]);
    });
});
