import type { Catalog, Operator } from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import type { Expression, Node } from '../expression/index.ts';
import { getVocabulary, minSize, weightOf } from '../grammar/index.ts';
import type { Grammar } from '../grammar/index.ts';
import { createRng } from '../random/index.ts';
import type { Seed } from '../random/index.ts';

export const GENERATOR_VERSION = 3;

/**
 * What one trunk level produces: the three channel nodes, the size the parent accounts for, and
 * whether the three are the _same_ node object (the whole subtree is shared, so the mono case
 * collapses to a single tree).
 */
interface TrunkResult {
    readonly nodes: readonly [Node, Node, Node];
    readonly size: number;
    readonly shared: boolean;
}

/**
 * Generates the three-channel expression of a grammar for a seed.
 *
 * The three channels correlate through `grammar.channels.shareDepth`: the top `shareDepth` levels
 * are the **shared trunk** — their operator and params are drawn once, so all channels agree there
 * — and below it each channel diverges on operators _and_ params (diverging on values alone would
 * only leave grey zones). `0` gives the historical three independent trees; `>= maxDepth` gives a
 * single tree, hence `r = g = b`.
 *
 * A terminal drawn inside the trunk ends its branch for good, so the deeper the trunk (or the
 * earlier a terminal falls), the more the channels coincide — this is the cost of correlation. The
 * budget is still per channel: the shared levels hand each channel the same budget, and a divergent
 * slot is accounted for at its widest channel, so every channel satisfies `maxNodes` and
 * `minDepth`.
 */
export function generate(catalog: Catalog, grammar: Grammar, seed: Seed): Expression {
    const rng = createRng(seed);
    const { minDepth, maxDepth, maxNodes } = grammar.constraints;
    const shareDepth = grammar.channels.shareDepth;

    const vocabulary: Operator[] = getVocabulary(catalog, grammar.weights);

    /**
     * Draws the operator of a node: candidates by depth and budget, sorted by name, then a weighted
     * draw. Shared by the diverging recursion and the trunk, so both obey the same grammar rules.
     */
    function drawOperator(currentDepth: number, budget: number): Operator {
        const candidates = vocabulary.filter((operator) => {
            const k = operator.arity;
            if (k === 0) {
                return currentDepth >= minDepth;
            }
            return (
                currentDepth < maxDepth &&
                1 + k * minSize(currentDepth + 1, minDepth, vocabulary) <= budget
            );
        });

        if (candidates.length === 0) {
            throw new Error(
                `Generator error: no candidates found at depth ${currentDepth} with budget ${budget}`,
            );
        }

        candidates.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        return rng.weighted(candidates, (candidate) => weightOf(grammar.weights, candidate.name));
    }

    function drawParams(operator: Operator): number[] {
        const paramValues: number[] = [];

        for (const param of operator.params) {
            const u = rng.next();
            const raw = param.min + u * (param.max - param.min);
            const rounded = Math.round(raw * 1000) / 1000;
            const clamped = Math.min(param.max, Math.max(param.min, rounded));

            paramValues.push(Object.is(clamped, -0) || clamped === 0 ? 0 : clamped);
        }

        return paramValues;
    }

    /** One node of ONE channel's tree, below the trunk: the historical recursion. */
    function generateNode(currentDepth: number, budget: number): { node: Node; size: number } {
        const operator = drawOperator(currentDepth, budget);
        const paramValues = drawParams(operator);

        const k = operator.arity;
        const childNodes: Node[] = [];
        let totalChildSize = 0;

        if (k > 0) {
            const m = minSize(currentDepth + 1, minDepth, vocabulary);
            let libre = budget - 1 - k * m;

            for (let i = 0; i < k; i++) {
                const childBudget = m + Math.floor(libre / (k - i));
                const childResult = generateNode(currentDepth + 1, childBudget);

                childNodes.push(childResult.node);
                totalChildSize += childResult.size;
                libre -= childResult.size - m;
            }
        }

        return {
            node: createNode(catalog, operator.name, childNodes, paramValues),
            size: 1 + totalChildSize,
        };
    }

    /** One trunk level, or a diverging slot below it, for the three channels at once. */
    function generateTrunk(currentDepth: number, budget: number): TrunkResult {
        // Below the trunk the channels diverge: three independent draws from the same stream. The
        // parent accounts for the widest channel, so each channel still fits the shared budget.
        if (currentDepth > shareDepth) {
            const r = generateNode(currentDepth, budget);
            const g = generateNode(currentDepth, budget);
            const b = generateNode(currentDepth, budget);

            return {
                nodes: [r.node, g.node, b.node],
                size: Math.max(r.size, g.size, b.size),
                shared: false,
            };
        }

        // Inside the trunk the operator and params are drawn once, so the channels agree here.
        const operator = drawOperator(currentDepth, budget);
        const paramValues = drawParams(operator);

        const k = operator.arity;
        const childResults: TrunkResult[] = [];

        if (k > 0) {
            const m = minSize(currentDepth + 1, minDepth, vocabulary);
            let libre = budget - 1 - k * m;

            for (let i = 0; i < k; i++) {
                const childBudget = m + Math.floor(libre / (k - i));
                const childResult = generateTrunk(currentDepth + 1, childBudget);

                childResults.push(childResult);
                libre -= childResult.size - m;
            }
        }

        const size = 1 + childResults.reduce((sum, child) => sum + child.size, 0);
        const childrenAt = (channel: number): readonly Node[] =>
            childResults.map((child) => child.nodes[channel]);

        // A subtree that never diverges is built once and handed to all three channels, so the
        // mono case (`shareDepth >= maxDepth`) really is a single tree.
        if (childResults.every((child) => child.shared)) {
            const node = createNode(catalog, operator.name, childrenAt(0), paramValues);

            return { nodes: [node, node, node], size, shared: true };
        }

        return {
            nodes: [
                createNode(catalog, operator.name, childrenAt(0), paramValues),
                createNode(catalog, operator.name, childrenAt(1), paramValues),
                createNode(catalog, operator.name, childrenAt(2), paramValues),
            ],
            size,
            shared: false,
        };
    }

    const roots = generateTrunk(1, maxNodes);

    return createExpression(roots.nodes[0], roots.nodes[1], roots.nodes[2]);
}
