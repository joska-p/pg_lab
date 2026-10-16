import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import { createGrammar, fitConstraints, getVocabulary } from './grammar.ts';
import { MAX_DEPTH, MAX_NODES } from './types.ts';

const catalog = createDefaultCatalog();

const sets: Record<string, Record<string, number>> = {
    terminalsOnly: { x: 1 },
    binary: { x: 1, add: 1 },
    withUnary: { x: 1, neg: 1, add: 1 },
};

const operators = (name: string) => getVocabulary(catalog, sets[name]);

describe('fitConstraints', () => {
    it('rounds and clamps to the hard limits', () => {
        expect(
            fitConstraints(operators('binary'), { minDepth: 2.4, maxDepth: 99, maxNodes: 1000 }),
        ).toEqual({ minDepth: 2, maxDepth: MAX_DEPTH, maxNodes: MAX_NODES });
    });

    it('keeps maxDepth and brings minDepth along when maxDepth drops below it', () => {
        expect(
            fitConstraints(operators('binary'), { minDepth: 5, maxDepth: 3, maxNodes: 60 }),
        ).toEqual({ minDepth: 3, maxDepth: 3, maxNodes: 60 });
    });

    it('raises maxNodes to the minimum size when it is infeasible', () => {
        // Binary only: minDepth 4 needs 15 nodes.
        expect(
            fitConstraints(operators('binary'), { minDepth: 4, maxDepth: 8, maxNodes: 5 }),
        ).toEqual({ minDepth: 4, maxDepth: 8, maxNodes: 15 });
    });

    it('lowers minDepth when even MAX_NODES is not enough', () => {
        // Binary only: minDepth 9 needs 511 nodes, minDepth 8 needs 255.
        expect(
            fitConstraints(operators('binary'), { minDepth: 9, maxDepth: 16, maxNodes: 400 }),
        ).toEqual({ minDepth: 8, maxDepth: 16, maxNodes: 400 });
    });

    it('leaves a feasible set untouched (unary operator available)', () => {
        const constraints = { minDepth: 4, maxDepth: 8, maxNodes: 5 };

        expect(fitConstraints(operators('withUnary'), constraints)).toEqual(constraints);
    });

    it('forces minDepth to 1 without any non-terminal', () => {
        expect(
            fitConstraints(operators('terminalsOnly'), { minDepth: 5, maxDepth: 8, maxNodes: 10 }),
        ).toEqual({ minDepth: 1, maxDepth: 8, maxNodes: 10 });
    });

    it('repairs non-finite input to the concept shape (findings F12: not "NaN → min")', () => {
        expect(
            fitConstraints(operators('binary'), {
                minDepth: Number.NaN,
                maxDepth: Number.POSITIVE_INFINITY,
                maxNodes: Number.NaN,
            }),
        ).toEqual({ minDepth: 3, maxDepth: 8, maxNodes: 60 });
    });

    it('always returns constraints that pass createGrammar (random input)', () => {
        const rng = createRng(createSeed(2026));

        for (const [name, weights] of Object.entries(sets)) {
            for (let i = 0; i < 300; i++) {
                const fitted = fitConstraints(operators(name), {
                    minDepth: rng.next() * 40 - 5,
                    maxDepth: rng.next() * 40 - 5,
                    maxNodes: rng.next() * 1000 - 100,
                });

                expect(Number.isInteger(fitted.minDepth), name).toBe(true);
                expect(Number.isInteger(fitted.maxDepth), name).toBe(true);
                expect(Number.isInteger(fitted.maxNodes), name).toBe(true);
                expect(
                    () => createGrammar(catalog, { weights, constraints: fitted }),
                    name,
                ).not.toThrow();
            }
        }
    });
});
