import { createGrammar, grammarRegistry, weightOf } from '@repo/randomart-core/grammar';
import { createSeed } from '@repo/randomart-core/seed';
import { describe, expect, it } from 'vite-plus/test';

import { createBatcher } from './batcher';
import { resolveIntents } from './intents';

const CURRENT = { grammar: grammarRegistry.default.grammar, seed: createSeed('1') };

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
        expect(weightOf(draft!.grammar, 'sin')).toBe(5);
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
        scheduled[0]();

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
