import { catalog } from '../catalog/default';
import type { Operator } from '../catalog/operators/Operator';
import { CONFIG } from '../config/config';
import { createExpression, createNode } from '../expression/expression';
import type { Expression, Node } from '../expression/types';
import { constraintsOf, getVocabulary, minSize, weightOf } from '../grammar/grammar';
import type { Grammar } from '../grammar/types';
import { createRng } from '../random/rng';
import type { Seed } from '../random/seed';

// Increment on any change altering output for a given seed: PRNG algorithm, draw order, rule, or rounding.
export const GENERATOR_VERSION = 4;

/** Integer scale of the param rounding: `PARAM_DECIMALS` decimal places. */
const PARAM_SCALE = 10 ** CONFIG.generator.paramDecimals;

interface TrunkResult {
    readonly nodes: readonly [Node, Node, Node];
    readonly size: number;
    readonly shared: boolean;
}

/**
 * Generates a three-channel expression from a grammar and seed.
 *
 * Channels share the top `shareDepth` levels (same operator + params). Below that, they diverge on
 * both operators and params. `shareDepth = 0` = three independent trees; `>= maxDepth` = single
 * tree. Budget is per-channel; shared levels give each channel the same budget. Cannot get stuck on
 * a valid grammar: each node gets budget >= minSize(depth), so a candidate always exists.
 */
export function generate(grammar: Grammar, seed: Seed): Expression {
    const rng = createRng(seed);
    const { minDepth, maxDepth, maxNodes } = constraintsOf(grammar.size);
    const { shareDepth } = grammar;

    const vocabulary: Operator[] = getVocabulary(grammar.weights);

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
            const rounded = Math.round(raw * PARAM_SCALE) / PARAM_SCALE;
            const clamped = Math.min(param.max, Math.max(param.min, rounded));

            paramValues.push(Object.is(clamped, -0) || clamped === 0 ? 0 : clamped);
        }

        return paramValues;
    }

    function buildChildren<T extends { size: number }>(
        currentDepth: number,
        budget: number,
        k: number,
        build: (childBudget: number) => T,
    ): T[] {
        const m = minSize(currentDepth + 1, minDepth, vocabulary);
        let remaining = budget - 1 - k * m;
        const children: T[] = [];

        for (let i = 0; i < k; i++) {
            const childBudget = m + Math.floor(remaining / (k - i));
            const child = build(childBudget);

            children.push(child);
            remaining -= child.size - m;
        }

        return children;
    }

    function generateNode(currentDepth: number, budget: number): { node: Node; size: number } {
        const operator = drawOperator(currentDepth, budget);
        const paramValues = drawParams(operator);
        const children =
            operator.arity > 0
                ? buildChildren(currentDepth, budget, operator.arity, (childBudget) =>
                      generateNode(currentDepth + 1, childBudget),
                  )
                : [];

        return {
            node: createNode(
                catalog,
                operator.name,
                children.map((child) => child.node),
                paramValues,
            ),
            size: 1 + children.reduce((sum, child) => sum + child.size, 0),
        };
    }

    function generateTrunk(currentDepth: number, budget: number): TrunkResult {
        // Below trunk: channels diverge; parent accounts for widest channel so each fits shared budget.
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

        // Inside trunk: operator and params drawn once, channels agree here.
        const operator = drawOperator(currentDepth, budget);
        const paramValues = drawParams(operator);
        const childResults =
            operator.arity > 0
                ? buildChildren(currentDepth, budget, operator.arity, (childBudget) =>
                      generateTrunk(currentDepth + 1, childBudget),
                  )
                : [];

        const size = 1 + childResults.reduce((sum, child) => sum + child.size, 0);
        const childrenAt = (channel: number): readonly Node[] =>
            childResults.map((child) => child.nodes[channel]);

        // Mono case (shareDepth >= maxDepth): single tree built once, handed to all three channels.
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
