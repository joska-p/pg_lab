import * as fc from 'fast-check';
import { describe, expect, it } from 'vite-plus/test';

import { compile } from './emit';
import { GrammarDrawError } from './errors';
import { evaluate } from './evaluate';
import { generate } from './generate';
import { createGrammar, drawGrammar, grammarRegistry, minimumNodes, vocabulary } from './grammar';
import type { Grammar, GrammarPins } from './grammar';
import { ops } from './ops';
import type { OpName, Point } from './ops';
import { createRng } from './rng';
import type { Rng } from './rng';
import { EPS, seedOf, defined } from './testing/fixtures';
import type { Expression, Node } from './tree';

function tryDrawGrammar(rng: Rng, pins: GrammarPins): Grammar | null {
    try {
        return drawGrammar(rng, pins);
    } catch (error) {
        if (error instanceof GrammarDrawError) {
            return null; // no feasible grammar exists for these pins
        }
        throw error;
    }
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

function allValuesInRange(expression: Expression): boolean {
    let ok = true;
    for (const channel of [expression.r, expression.g, expression.b]) {
        eachNode(channel, (node) => {
            const spec = ops[node.op].params;
            if (spec === undefined) {
                return;
            }
            for (const [name, range] of Object.entries(spec)) {
                const value = defined(node.params[name], `${node.op}.${name}`);
                if (value < range.min || value > range.max) {
                    ok = false;
                }
            }
        });
    }
    return ok;
}

function evaluateChannelsInRange(expression: Expression): boolean {
    const points: readonly Point[] = [
        { x: -1, y: -1, phase: 0 },
        { x: 0, y: 0, phase: 0 },
        { x: 1, y: 1, phase: 0 },
        { x: -1, y: 1, phase: 0.5 },
        { x: 0.5, y: -0.5, phase: 0.25 },
        { x: 0.3, y: 0.7, phase: 0.75 },
        { x: -0.8, y: 0.2, phase: 0.1 },
        { x: 0.9, y: -0.9, phase: 0.9 },
    ];

    for (const point of points) {
        const result = evaluate(expression, point);
        if (
            result.r < -1 - EPS ||
            result.r > 1 + EPS ||
            result.g < -1 - EPS ||
            result.g > 1 + EPS ||
            result.b < -1 - EPS ||
            result.b > 1 + EPS
        ) {
            return false;
        }
    }
    return true;
}

const seedArb = fc.integer({ min: 0, max: 2 ** 31 - 1 });

describe('property-based tests', () => {
    it('generate never throws for a drawn grammar', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const expression = generate(grammar, seedOf(seedInt + 1));
                expect(expression).toBeDefined();
            }),
            { numRuns: 200 },
        );
    });

    it('compile accepts the result of generate for any drawn grammar', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const expression = generate(grammar, seedOf(seedInt + 1));
                const compiled = compile(expression, { space: grammar.space });
                expect(compiled.source).toBeDefined();
                expect(compiled.source.length).toBeGreaterThan(0);
            }),
            { numRuns: 200 },
        );
    });

    it('CPU evaluation stays in [-1, 1] for drawn grammars', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const expression = generate(grammar, seedOf(seedInt + 1));
                expect(evaluateChannelsInRange(expression)).toBe(true);
            }),
            { numRuns: 200 },
        );
    });

    it('a grammar sized at its minimum still generates', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const tight = createGrammar({ ...grammar, maxNodes: minimumNodes(grammar) });
                const expression = generate(tight, seedOf(seedInt + 1));
                for (const channel of [expression.r, expression.g, expression.b]) {
                    expect(countNodes(channel)).toBeLessThanOrEqual(tight.maxNodes);
                }
            }),
            { numRuns: 200 },
        );
    });

    it('one node fewer than the minimum is infeasible', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const min = minimumNodes(grammar);
                if (min <= 1) {
                    return;
                }
                expect(() => createGrammar({ ...grammar, maxNodes: min - 1 })).toThrow(
                    /Grammar is infeasible/,
                );
            }),
            { numRuns: 200 },
        );
    });

    it('minimumNodes validation rejects infeasible grammars', () => {
        expect(() =>
            createGrammar({
                weights: { add: 1, x: 1 },
                minDepth: 6,
                maxDepth: 8,
                maxNodes: 8,
                shareDepth: 0,
                space: 'srgb',
            }),
        ).toThrow('Grammar is infeasible');
    });

    it('drawGrammar with pins produces feasible grammars when possible', () => {
        fc.assert(
            fc.property(
                seedArb,
                fc.record({
                    minDepth: fc.integer({ min: 1, max: 4 }),
                    maxDepthOffset: fc.integer({ min: 0, max: 4 }),
                    maxNodes: fc.integer({ min: 8, max: 68 }),
                    shareDepth: fc.integer({ min: 0, max: 6 }),
                }),
                (seedInt, pins) => {
                    const minDepth = pins.minDepth;
                    const maxDepth = minDepth + pins.maxDepthOffset;
                    const shareDepth = Math.min(pins.shareDepth, maxDepth);
                    const rng = createRng(seedOf(seedInt));
                    const grammar = tryDrawGrammar(rng, {
                        minDepth,
                        maxDepth,
                        maxNodes: pins.maxNodes,
                        shareDepth,
                    });
                    if (grammar === null) {
                        return;
                    }
                    expect(minimumNodes(grammar)).toBeLessThanOrEqual(grammar.maxNodes);
                    expect(grammar.minDepth).toBe(minDepth);
                    expect(grammar.maxDepth).toBe(maxDepth);
                    expect(grammar.maxNodes).toBe(pins.maxNodes);
                    expect(grammar.shareDepth).toBe(shareDepth);
                },
            ),
            { numRuns: 100 },
        );
    });

    it('all registry grammars are feasible', () => {
        for (const grammar of Object.values(grammarRegistry).map((preset) => preset.grammar)) {
            const min = minimumNodes(grammar);
            expect(min).toBeLessThanOrEqual(grammar.maxNodes);
        }
    });

    it('generated expression node count respects maxNodes per channel', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const expression = generate(grammar, seedOf(seedInt + 1));
                for (const channel of [expression.r, expression.g, expression.b]) {
                    expect(countNodes(channel)).toBeLessThanOrEqual(grammar.maxNodes);
                }
            }),
            { numRuns: 200 },
        );
    });

    it('generated expression depth respects minDepth and maxDepth', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const expression = generate(grammar, seedOf(seedInt + 1));

                function depthOf(node: Node): number {
                    return 1 + Math.max(0, ...node.inputs.map(depthOf));
                }

                for (const channel of [expression.r, expression.g, expression.b]) {
                    const d = depthOf(channel);
                    expect(d).toBeGreaterThanOrEqual(grammar.minDepth);
                    expect(d).toBeLessThanOrEqual(grammar.maxDepth);
                }
            }),
            { numRuns: 200 },
        );
    });

    it('generated expression uses only enabled vocabulary', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const expression = generate(grammar, seedOf(seedInt + 1));
                const enabled = new Set<OpName>(vocabulary(grammar));

                for (const channel of [expression.r, expression.g, expression.b]) {
                    eachNode(channel, (node) => {
                        expect(enabled.has(node.op)).toBe(true);
                    });
                }
            }),
            { numRuns: 200 },
        );
    });

    it('generated expression parameters are in declared ranges', () => {
        fc.assert(
            fc.property(seedArb, (seedInt) => {
                const rng = createRng(seedOf(seedInt));
                const grammar = drawGrammar(rng);
                const expression = generate(grammar, seedOf(seedInt + 1));
                expect(allValuesInRange(expression)).toBe(true);
            }),
            { numRuns: 200 },
        );
    });
});
