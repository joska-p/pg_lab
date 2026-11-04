import { RandomArtError } from './errors';
import { createMinimumSizer, vocabulary, weightOf } from './grammar';
import type { Grammar } from './grammar';
import { ops } from './ops';
import type { OpName } from './ops';
import { createRng } from './rng';
import type { Rng } from './rng';
import type { Seed } from './seed';
import { createExpression, createNode } from './tree';
import type { Expression, Node } from './tree';

/**
 * Bumped whenever a change to generation would make an existing `(grammar, seed)` produce a
 * different expression. Persisted seeds must be replayed with the version they were created with.
 */
export const GENERATOR_VERSION = 1;

const PARAM_DECIMALS = 3;
const PARAM_SCALE = 10 ** PARAM_DECIMALS;

interface SizedNode {
    readonly node: Node;
    readonly size: number;
}

interface Trunk {
    readonly nodes: readonly [Node, Node, Node];
    readonly size: number;
}

interface GenState {
    readonly grammar: Grammar;
    readonly vocabulary: readonly OpName[];
    readonly rng: Rng;
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly minimumSize: (depth: number) => number;
}

function roundToPrecision(value: number): number {
    const rounded = Math.round(value * PARAM_SCALE) / PARAM_SCALE;
    return rounded === 0 ? 0 : rounded;
}

function clampToRange(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function drawContinuous(rng: Rng, min: number, max: number): number {
    return clampToRange(roundToPrecision(min + rng.next() * (max - min)), min, max);
}

function drawStepped(rng: Rng, min: number, max: number, step: number): number {
    const levelCount = Math.round((max - min) / step) + 1;
    if (levelCount <= 1) {
        return min;
    }
    return roundToPrecision(min + rng.int(levelCount) * step);
}

function drawParams(state: GenState, name: OpName): Record<string, number> {
    const spec = ops[name].params;
    const params: Record<string, number> = {};
    if (spec === undefined) {
        return params;
    }
    for (const [paramName, range] of Object.entries(spec)) {
        params[paramName] =
            range.step === undefined
                ? drawContinuous(state.rng, range.min, range.max)
                : drawStepped(state.rng, range.min, range.max, range.step);
    }
    return params;
}

function drawOperator(state: GenState, depth: number, budget: number): OpName {
    const candidates: OpName[] = [];
    for (const name of state.vocabulary) {
        const { arity } = ops[name];
        if (arity === 0) {
            if (depth >= state.minDepth) {
                candidates.push(name);
            }
            continue;
        }
        const needed = 1 + arity * state.minimumSize(depth + 1);
        if (depth < state.maxDepth && needed <= budget) {
            candidates.push(name);
        }
    }

    if (candidates.length === 0) {
        throw new RandomArtError(`No operator available at depth ${depth} within budget ${budget}`);
    }
    return state.rng.weighted(candidates, (name) => weightOf(state.grammar, name));
}

function buildChildren<T extends { readonly size: number }>(
    state: GenState,
    depth: number,
    budget: number,
    arity: number,
    build: (budget: number) => T,
): T[] {
    const minimum = state.minimumSize(depth + 1);
    let remaining = budget - 1 - arity * minimum;
    const children: T[] = [];
    for (let index = 0; index < arity; index++) {
        const share = Math.floor(remaining / Math.max(1, arity - index));
        const child = build(minimum + share);
        children.push(child);
        remaining -= child.size - minimum;
    }
    return children;
}

function generateNode(state: GenState, depth: number, budget: number): SizedNode {
    const name = drawOperator(state, depth, budget);
    const params = drawParams(state, name);
    const { arity } = ops[name];
    const children =
        arity === 0
            ? []
            : buildChildren(state, depth, budget, arity, (childBudget) =>
                  generateNode(state, depth + 1, childBudget),
              );

    return {
        node: createNode(
            name,
            children.map((child) => child.node),
            params,
        ),
        size: 1 + children.reduce((total, child) => total + child.size, 0),
    };
}

function generateTrunk(state: GenState, depth: number, budget: number): Trunk {
    if (depth > state.grammar.shareDepth) {
        const channels = [
            generateNode(state, depth, budget),
            generateNode(state, depth, budget),
            generateNode(state, depth, budget),
        ];
        return {
            nodes: [channels[0].node, channels[1].node, channels[2].node],
            size: Math.max(...channels.map((channel) => channel.size)),
        };
    }

    const name = drawOperator(state, depth, budget);
    const params = drawParams(state, name);
    const { arity } = ops[name];
    const children =
        arity === 0
            ? []
            : buildChildren(state, depth, budget, arity, (childBudget) =>
                  generateTrunk(state, depth + 1, childBudget),
              );

    const channel = (index: number): Node =>
        createNode(
            name,
            children.map((child) => child.nodes[index]),
            params,
        );

    return {
        nodes: [channel(0), channel(1), channel(2)],
        size: 1 + children.reduce((total, child) => total + child.size, 0),
    };
}

/**
 * Synthesize one expression from a grammar and a seed. The generator grows a three-channel trunk:
 * down to `shareDepth` the channels pick the same operator, below it they diverge.
 */
export function generate(grammar: Grammar, seed: Seed): Expression {
    const vocab = vocabulary(grammar);
    const state: GenState = {
        grammar,
        vocabulary: vocab,
        rng: createRng(seed),
        minDepth: grammar.minDepth,
        maxDepth: grammar.maxDepth,
        minimumSize: createMinimumSizer(vocab, grammar.minDepth),
    };

    const trunk = generateTrunk(state, 1, grammar.maxNodes);
    return createExpression(trunk.nodes[0], trunk.nodes[1], trunk.nodes[2]);
}
