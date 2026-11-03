import { describe, expect, it } from 'vite-plus/test';

import { generate } from './generate';
import {
    SIZE_PROFILE_IDS,
    SIZE_PROFILES,
    createGrammar,
    grammarRegistry,
    vocabulary,
} from './grammar';
import { ops } from './ops';
import type { OpName } from './ops';
import { formatFormula } from './tree';
import type { Expression, Node } from './tree';

const DEFAULT_GRAMMAR = grammarRegistry.default;

/** Seeds whose formulas are pinned by the snapshot: changing one is a deliberate act. */
const SNAPSHOT_SEEDS = [0, 42, 1234] as const;

/** Seeds used to compare streams: none of them may collide. */
const DISTINCT_SEEDS = [0, 1, 2, 3, 42, 1234] as const;

/** Human-readable identity of an expression, one formula per channel. */
function formulas(expression: Expression): Readonly<Record<'r' | 'g' | 'b', string>> {
    return {
        r: formatFormula(expression.r),
        g: formatFormula(expression.g),
        b: formatFormula(expression.b),
    };
}

function depthOf(node: Node): number {
    return 1 + Math.max(0, ...node.inputs.map(depthOf));
}

function countNodes(node: Node): number {
    return 1 + node.inputs.reduce((total, child) => total + countNodes(child), 0);
}

function eachNode(node: Node, visit: (node: Node) => void): void {
    visit(node);
    for (const child of node.inputs) {
        eachNode(child, visit);
    }
}

/** Every parameter is present, inside its declared range, and aligned on its step grid. */
function checkParams(node: Node): void {
    const spec = ops[node.op].params ?? {};
    for (const [name, range] of Object.entries(spec)) {
        const value = node.params[name];
        const label = `${node.op}.${name}`;
        expect(value, label).toBeGreaterThanOrEqual(range.min);
        expect(value, label).toBeLessThanOrEqual(range.max);
        if (range.step !== undefined) {
            const levels = value / range.step;
            expect(Math.abs(levels - Math.round(levels)), label).toBeLessThan(1e-9);
        }
    }
}

function channels(expression: Expression): readonly Node[] {
    return [expression.r, expression.g, expression.b];
}

describe('generate', () => {
    it('reproduces the same formula for the same seed', () => {
        for (const seed of SNAPSHOT_SEEDS) {
            expect(formulas(generate(DEFAULT_GRAMMAR, seed))).toEqual(
                formulas(generate(DEFAULT_GRAMMAR, seed)),
            );
        }
    });

    it('draws distinct formulas for distinct seeds', () => {
        const drawn = new Set(
            DISTINCT_SEEDS.map((seed) => JSON.stringify(formulas(generate(DEFAULT_GRAMMAR, seed)))),
        );

        expect(drawn.size).toBe(DISTINCT_SEEDS.length);
    });

    it('pins the generated formulas for fixed seeds', () => {
        const snapshot = Object.fromEntries(
            SNAPSHOT_SEEDS.map((seed) => [
                `seed${seed}`,
                formulas(generate(DEFAULT_GRAMMAR, seed)),
            ]),
        );

        expect(snapshot).toMatchSnapshot();
    });

    it('respects the size profile and the grammar vocabulary', () => {
        for (const size of SIZE_PROFILE_IDS) {
            const { minDepth, maxDepth, maxNodes } = SIZE_PROFILES[size];

            for (let shareDepth = 0; shareDepth <= maxDepth; shareDepth++) {
                const grammar = createGrammar({
                    weights: DEFAULT_GRAMMAR.weights,
                    size,
                    shareDepth,
                });
                const enabled = new Set<OpName>(vocabulary(grammar));

                for (const seed of [0, 7, 99]) {
                    for (const channel of channels(generate(grammar, seed))) {
                        expect(countNodes(channel)).toBeLessThanOrEqual(maxNodes);
                        expect(depthOf(channel)).toBeGreaterThanOrEqual(minDepth);
                        expect(depthOf(channel)).toBeLessThanOrEqual(maxDepth);
                        eachNode(channel, (node) => {
                            expect(enabled.has(node.op), `${node.op} in ${size}`).toBe(true);
                        });
                    }
                }
            }
        }
    });

    it('draws parameters inside their declared range and on their step grid', () => {
        for (const seed of SNAPSHOT_SEEDS) {
            for (const channel of channels(generate(DEFAULT_GRAMMAR, seed))) {
                eachNode(channel, checkParams);
            }
        }
    });

    it('honours a minimal vocabulary and still fills minDepth', () => {
        const grammar = createGrammar({
            weights: { neg: 1, x: 1 },
            size: 'medium',
            shareDepth: 0,
        });
        const { minDepth } = SIZE_PROFILES.medium;

        for (const seed of [1, 2, 3]) {
            for (const channel of channels(generate(grammar, seed))) {
                // `neg` is the only non-terminal, so it must root every channel.
                expect(channel.op).toBe('neg');
                expect(depthOf(channel)).toBeGreaterThanOrEqual(minDepth);
            }
        }
    });
});
