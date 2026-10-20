import { describe, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import type { Node } from '../expression/index.ts';
import { generate } from '../generator/index.ts';
import { constraintsOf, createGrammar, defaultGrammar } from '../grammar/index.ts';
import { createSeed } from '../random/index.ts';

/**
 * Opt-in probe for the "budget distribution" question: the split `m + floor(remaining / (k - i))`
 * leaves the remainder to the last child, so the rightmost subtree may be systematically larger.
 * This measures that bias (and tree size/depth, to inform the default constraints).
 *
 *     VITE_MEASURE=1 vp test budget
 *
 * Opt-in probe (committed, runs only under `VITE_MEASURE=1`), no assertions, mirrors the
 * fieldDist/fieldRender probes.
 */
const enabled = import.meta.env.VITE_MEASURE === '1';
const CASES = Number(import.meta.env.VITE_FUZZ_COUNT ?? 5000);

const size = (node: Node): number => 1 + node.inputs.reduce((sum, child) => sum + size(child), 0);

const depth = (node: Node): number =>
    1 + (node.inputs.length === 0 ? 0 : Math.max(...node.inputs.map(depth)));

const mean = (xs: number[]): number => xs.reduce((s, v) => s + v, 0) / xs.length;

const quantile = (xs: number[], p: number): number =>
    [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(p * xs.length))];

describe('generator budget', () => {
    it.skipIf(!enabled)(
        'reports child-size bias and tree stats',
        () => {
            const catalog = createDefaultCatalog();
            const grammar = defaultGrammar(catalog);
            const { minDepth, maxDepth, maxNodes } = constraintsOf(grammar.size);
            /** Mean child size normalised by the node's total child size, per child index. */
            const binarySharesFirst: number[] = [];
            const binarySharesSecond: number[] = [];
            let binaryLastIsLargest = 0;
            let binaryNodes = 0;
            const sizes: number[] = [];
            const depths: number[] = [];
            let hitMaxDepth = 0;
            let hitMaxNodes = 0;
            const unrelatedSizes: number[] = [];

            const walk = (node: Node): void => {
                if (node.inputs.length === 2) {
                    binaryNodes++;
                    const [first, second] = node.inputs.map(size);
                    const total = first + second;
                    binarySharesFirst.push(first / total);
                    binarySharesSecond.push(second / total);
                    if (second > first) {
                        binaryLastIsLargest++;
                    }
                }

                for (const child of node.inputs) {
                    walk(child);
                }
            };

            for (let i = 0; i < CASES; i++) {
                const seed = createSeed(i * 7919 + 1);
                const expression = generate(catalog, grammar, seed);
                walk(expression.r);
                const treeSize = size(expression.r);
                const treeDepth = depth(expression.r);
                sizes.push(treeSize);
                depths.push(treeDepth);
                if (treeSize >= maxNodes) {
                    hitMaxNodes++;
                }
                if (treeDepth >= maxDepth) {
                    hitMaxDepth++;
                }

                const unrelated = generate(
                    catalog,
                    createGrammar(catalog, {
                        weights: grammar.weights,
                        size: grammar.size,
                        shareDepth: 0,
                        space: 'srgb',
                    }),
                    seed,
                );
                unrelatedSizes.push(size(unrelated.r) + size(unrelated.g) + size(unrelated.b));
            }

            const pctOf = (count: number): string => ((100 * count) / CASES).toFixed(1);
            const pctOfBinary = (count: number): string => ((100 * count) / binaryNodes).toFixed(1);

            console.log(
                `[budget] cases=${CASES} constraints=${minDepth}/${maxDepth}/${maxNodes}\n` +
                    `  binary child share: first=${mean(binarySharesFirst).toFixed(3)} second=${mean(binarySharesSecond).toFixed(3)} ` +
                    `(second largest in ${pctOfBinary(binaryLastIsLargest)}% of ${binaryNodes})\n` +
                    `  tree size : mean ${mean(sizes).toFixed(1)} p50 ${quantile(sizes, 0.5)} p95 ${quantile(sizes, 0.95)} p99 ${quantile(sizes, 0.99)} max ${quantile(sizes, 1)}\n` +
                    `  tree depth: mean ${mean(depths).toFixed(1)} p50 ${quantile(depths, 0.5)} p95 ${quantile(depths, 0.95)} max ${quantile(depths, 1)}\n` +
                    `  at maxDepth: ${pctOf(hitMaxDepth)}%   at maxNodes: ${pctOf(hitMaxNodes)}%\n` +
                    `  unrelated (3 trees) total nodes: mean ${mean(unrelatedSizes).toFixed(1)} p95 ${quantile(unrelatedSizes, 0.95)} max ${quantile(unrelatedSizes, 1)}`,
            );
        },
        120_000,
    );
});
