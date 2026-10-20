import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { CONFIG } from '../config/index.ts';
import {
    constraintsOf,
    createGrammar,
    defaultGrammar,
    getVocabulary,
    isLastNonTerminal,
    isLastTerminal,
    minSize,
} from './index.ts';

/** Copies a grammar's partial weights into a mutable full record, absent entries becoming 0. */
function mutableWeights(grammar: {
    weights: Readonly<Record<string, number | undefined>>;
}): Record<string, number> {
    const weights: Record<string, number> = {};

    for (const [name, weight] of Object.entries(grammar.weights)) {
        weights[name] = weight ?? 0;
    }

    return weights;
}

/** A minimal valid point: one terminal, one non-terminal, a valid size/space. */
const VALID = {
    weights: { x: 1, add: 1 },
    size: 'medium',
    shareDepth: 2,
    space: 'oklch',
} as const;

describe('grammar: minSize', () => {
    const catalog = createDefaultCatalog();

    it('calculates minSize correctly for binary only non-terminals', () => {
        const binaryOperators = [catalog.operator('add')];
        // minDepth = 4, k = 2
        // currentDepth=4: 1
        // currentDepth=3: 1 + 2*1 = 3
        // currentDepth=2: 1 + 2*3 = 7
        // currentDepth=1: 1 + 2*7 = 15
        expect(minSize(4, 4, binaryOperators)).toBe(1);
        expect(minSize(3, 4, binaryOperators)).toBe(3);
        expect(minSize(2, 4, binaryOperators)).toBe(7);
        expect(minSize(1, 4, binaryOperators)).toBe(15);
    });

    it('calculates minSize correctly when unary non-terminal is available', () => {
        const unaryAndBinaryOperators = [catalog.operator('neg'), catalog.operator('add')];
        // minDepth = 4, k = 1
        // currentDepth=4: 1
        // currentDepth=3: 1 + 1*1 = 2
        // currentDepth=2: 1 + 1*2 = 3
        // currentDepth=1: 1 + 1*3 = 4
        expect(minSize(1, 4, unaryAndBinaryOperators)).toBe(4);
    });

    it('returns 1 when currentDepth >= minDepth', () => {
        expect(minSize(5, 3, [catalog.operator('add')])).toBe(1);
    });
});

describe('grammar: createGrammar validations', () => {
    const catalog = createDefaultCatalog();

    it('rejects unknown operator', () => {
        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                weights: { x: 1, nonexistent: 1 },
            }),
        ).toThrow(/does not exist in catalog/);
    });

    it('accepts weight 0 (off) and rejects out-of-range or non-integer weights', () => {
        expect(
            createGrammar(catalog, {
                ...VALID,
                weights: { x: 0, y: 0, const: 1, add: 1 },
            }),
        ).toBeTruthy();

        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                weights: { x: -1, add: 1 },
            }),
        ).toThrow('Randomart: weight of operator "x" must be an integer in [0, 4], received -1');

        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                weights: { x: CONFIG.grammar.maxWeight + 1, add: 1 },
            }),
        ).toThrow(
            `Randomart: weight of operator "x" must be an integer in [0, ${CONFIG.grammar.maxWeight}], received ${CONFIG.grammar.maxWeight + 1}`,
        );

        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                weights: { x: 1.5, add: 1 },
            }),
        ).toThrow('Randomart: weight of operator "x" must be an integer, received 1.5');
    });

    it('rejects non-finite weights', () => {
        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                weights: { x: Number.NaN, add: 1 },
            }),
        ).toThrow('Randomart: weight of operator "x" must be a finite number, received NaN');
    });

    it('rejects empty weights', () => {
        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                weights: {},
            }),
        ).toThrow('Randomart: grammar weights must not be empty');
    });

    it('rejects unknown size profile or color space', () => {
        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                size: 'nope' as never,
            }),
        ).toThrow(/unknown size profile/);

        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                space: 'nope' as never,
            }),
        ).toThrow(/unknown color space/);
    });

    it('rejects a vocabulary without an active terminal', () => {
        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                weights: { add: 1, mul: 0 },
            }),
        ).toThrow(/must contain at least one terminal/);
    });

    it('rejects a vocabulary without an active non-terminal', () => {
        // Every size profile has minDepth > 1, so a terminal-only vocabulary cannot grow a tree.
        expect(() =>
            createGrammar(catalog, {
                ...VALID,
                weights: { x: 1, y: 1, const: 1 },
            }),
        ).toThrow(/must contain at least one non-terminal/);
    });

    it('derives constraints from the size profile and never stores them', () => {
        const grammar = createGrammar(catalog, { ...VALID, size: 'small' });

        expect('constraints' in grammar).toBe(false);
        expect(constraintsOf(grammar.size)).toEqual(CONFIG.grammar.sizeProfiles.small);
    });

    it('repairs shareDepth into [0, maxDepth] and rounds it', () => {
        const shareDepth = (value: number, size: 'small' | 'large' = 'small'): number =>
            createGrammar(catalog, { ...VALID, size, shareDepth: value }).shareDepth;

        expect(shareDepth(-3)).toBe(0); // clamped up
        expect(shareDepth(99)).toBe(CONFIG.grammar.sizeProfiles.small.maxDepth); // clamped down
        expect(shareDepth(2.7)).toBe(3); // rounded
        expect(shareDepth(Number.NaN)).toBe(CONFIG.channels.shareDepth); // non-finite → default
        // The same value is valid in a deeper profile.
        expect(shareDepth(9, 'large')).toBe(9);
    });

    it('freezes the grammar and its weights', () => {
        const grammar = createGrammar(catalog, { ...VALID, weights: { y: 1, x: 2, add: 1 } });

        expect(Object.isFrozen(grammar)).toBe(true);
        expect(Object.isFrozen(grammar.weights)).toBe(true);
        expect(Object.keys(grammar.weights)).toEqual(['add', 'x', 'y']);
    });
});

describe('grammar: defaultGrammar', () => {
    const catalog = createDefaultCatalog();

    it('builds the default vocabulary (calibrated for structure)', () => {
        const grammar = defaultGrammar(catalog);
        expect(grammar.weights.x).toBe(CONFIG.grammar.maxWeight);
        expect(grammar.weights.y).toBe(CONFIG.grammar.maxWeight);
        expect(grammar.weights.max).toBe(2);
        expect(grammar.weights.min).toBe(2);
        expect(grammar.weights.const).toBe(1);
        expect(grammar.weights.mix).toBe(1);
        expect(grammar.weights.select).toBe(1);
        expect(grammar.weights.warp).toBe(1);
        expect(grammar.size).toBe('medium');
        expect(grammar.shareDepth).toBe(CONFIG.channels.shareDepth);
        expect(grammar.space).toBe(CONFIG.channels.space);
    });

    it('covers the whole catalog and uses the medium budget', () => {
        const grammar = defaultGrammar(catalog);

        for (const operator of catalog.operators()) {
            expect(Object.hasOwn(grammar.weights, operator.name)).toBe(true);
        }

        expect(constraintsOf(grammar.size)).toEqual(CONFIG.grammar.sizeProfiles.medium);
    });
});

describe('grammar: viability predicates', () => {
    const catalog = createDefaultCatalog();
    const terminals = catalog.operators().filter((operator) => operator.isTerminal);
    const nonTerminals = catalog.operators().filter((operator) => !operator.isTerminal);

    it('isLastTerminal is false while several terminals are active', () => {
        const { weights } = defaultGrammar(catalog);

        for (const terminal of terminals) {
            expect(isLastTerminal(catalog, weights, terminal.name)).toBe(false);
        }
    });

    it('isLastTerminal is true for the only active terminal, false for an inactive one', () => {
        const weights = mutableWeights(defaultGrammar(catalog));

        for (const terminal of terminals) {
            weights[terminal.name] = terminal.name === 'x' ? 1 : 0;
        }

        expect(isLastTerminal(catalog, weights, 'x')).toBe(true);
        expect(isLastTerminal(catalog, weights, 'y')).toBe(false);
    });

    it('isLastNonTerminal is true for the only active non-terminal', () => {
        const weights = mutableWeights(defaultGrammar(catalog));

        for (const operator of nonTerminals) {
            weights[operator.name] = operator.name === 'add' ? 1 : 0;
        }

        expect(isLastNonTerminal(catalog, weights, 'add')).toBe(true);
        expect(isLastNonTerminal(catalog, weights, 'neg')).toBe(false);
    });

    it('tracks what createGrammar refuses when emptying a kind', () => {
        const weights = mutableWeights(defaultGrammar(catalog));

        for (const terminal of terminals) {
            weights[terminal.name] = terminal.name === 'x' ? 1 : 0;
        }

        expect(isLastTerminal(catalog, weights, 'x')).toBe(true);
        expect(() => createGrammar(catalog, { ...VALID, weights: { ...weights, x: 0 } })).toThrow(
            /at least one terminal/,
        );

        const onlyAdd = mutableWeights(defaultGrammar(catalog));
        for (const operator of nonTerminals) {
            onlyAdd[operator.name] = operator.name === 'add' ? 1 : 0;
        }

        expect(isLastNonTerminal(catalog, onlyAdd, 'add')).toBe(true);
        expect(() => createGrammar(catalog, { ...VALID, weights: { ...onlyAdd, add: 0 } })).toThrow(
            /at least one non-terminal/,
        );
    });

    it('getVocabulary keeps only positive weights', () => {
        const names = getVocabulary(catalog, { x: 1, y: 0, add: 2, mul: 1 }).map(
            (operator) => operator.name,
        );

        expect(names).toEqual(['add', 'mul', 'x']);
    });
});
