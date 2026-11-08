import { createGrammar, getGrammarPreset, weightOf } from '@repo/randomart-core/grammar';
import { createSeed } from '@repo/randomart-core/seed';
import { describe, expect, it } from 'vite-plus/test';

import { defined } from '../testing/defined';
import { isSameDraft } from './artwork';
import { createBatcher } from './batcher';
import { withWeight } from './grammarEdits';
import { resolveIntents } from './intents';

const CURRENT = { grammar: getGrammarPreset('default').grammar, seed: createSeed('1') };

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
