import type { Channel } from './color';
import type { TreeView } from './format';
import { getOperator } from './grammar/operators/registry';
import type { OperatorId } from './grammar/operators/registry';
import type { Rule } from './grammar/rules/registry';
import { createCorrelatedRng, createDualRng, seededShuffle } from './prng';
import type { SeededRandom } from './prng';

export interface Node {
    readonly type: OperatorId;
    readonly args: Record<string, Node | number>;
}

interface PoolEntry {
    type: OperatorId;
    arity: number;
    weight: number;
}

/** Fallback pool when a rule provides no terminals of its own. */
export const DEFAULT_TERMINALS = [
    { type: 'x', arity: 0, weight: 1.0 },
    { type: 'y', arity: 0, weight: 1.0 },
    { type: 'const', arity: 0, weight: 0.5 },
] as const satisfies readonly PoolEntry[];

const operatorToPoolEntry = (id: OperatorId): PoolEntry => ({
    type: id,
    arity: getOperator(id).arity,
    weight: id === 'const' ? 0.5 : 1.0,
});

function buildOperatorPool(
    rng: SeededRandom,
    operators: readonly PoolEntry[],
    structuralProbability: number,
): PoolEntry[] {
    const pool: PoolEntry[] = [];

    for (const operator of operators) {
        if (operator.arity === 0 || rng.next() < structuralProbability) {
            pool.push(operator);
        }
    }

    return pool;
}

function weightedRandomPick(rng: SeededRandom, pool: readonly PoolEntry[]): PoolEntry {
    const totalWeight = pool.reduce((sum, operator) => sum + operator.weight, 0);
    let threshold = rng.next() * totalWeight;

    for (const operator of pool) {
        threshold -= operator.weight;

        if (threshold <= 0) {
            return operator;
        }
    }

    return pool[pool.length - 1];
}

export interface BuildTreeProps {
    rule: Rule;
    maxDepth: number;
    pickRng: (depth: number) => SeededRandom;
    currentDepth?: number;
    seedText?: string;
}

/**
 * Forces terminals at `maxDepth` and operators above `rule.minDepth`, so trees never run forever
 * nor collapse to a leaf too early.
 */
export function buildTree({
    rule,
    maxDepth,
    pickRng,
    currentDepth = 0,
    seedText = 'randomseed',
}: BuildTreeProps): Node {
    const rng = pickRng(currentDepth);
    const forceTerminal = currentDepth >= maxDepth;
    const forceOperator = currentDepth < rule.minDepth;

    const poolEntriesFromRule = [...rule.operatorIds].map(operatorToPoolEntry);
    const hasTerminals = poolEntriesFromRule.some((entry) => entry.arity === 0);
    const poolEntriesWithTerminals = hasTerminals
        ? poolEntriesFromRule
        : [...poolEntriesFromRule, ...DEFAULT_TERMINALS];
    const shuffledPoolEntries = seededShuffle(
        poolEntriesWithTerminals,
        `${seedText}_depth_${currentDepth}`,
    );

    let pool: PoolEntry[];

    if (forceTerminal) {
        pool = shuffledPoolEntries.filter((operator) => operator.arity === 0);

        if (pool.length === 0) {
            pool = [...DEFAULT_TERMINALS];
        }
    } else if (forceOperator) {
        pool = shuffledPoolEntries.filter((operator) => operator.arity > 0);

        if (pool.length === 0) {
            pool = [...shuffledPoolEntries];
        }
    } else {
        const structuralProbability = 1 - currentDepth / maxDepth;

        pool = buildOperatorPool(rng, shuffledPoolEntries, structuralProbability);
    }

    const pick = weightedRandomPick(rng, pool);
    const operator = getOperator(pick.type);
    const args: Record<string, Node | number> = {};

    for (const argName of operator.argNames) {
        if (pick.type === 'const' && argName === 'value') {
            args[argName] = Number(rng.nextRange(-1, 1).toFixed(4));
        } else {
            args[argName] = buildTree({
                rule,
                maxDepth,
                pickRng,
                currentDepth: currentDepth + 1,
            });
        }
    }

    return { type: pick.type, args };
}

export function evaluate(node: Node, x: number, y: number, t = 0): number {
    const operator = getOperator(node.type);
    const ctx = { x, y, t };
    const resolvedArgs: Record<string, number> = {};

    for (const name of operator.argNames) {
        const value = node.args[name];

        resolvedArgs[name] = typeof value === 'number' ? value : evaluate(value, x, y, t);
    }

    return operator.evaluate({ args: resolvedArgs, ctx });
}

export function toGLSL(node: Node, coordVar = 'p'): string {
    const op = getOperator(node.type);
    const resolvedArgs: Record<string, string> = {};

    for (const name of op.argNames) {
        const val = node.args[name];

        resolvedArgs[name] = typeof val === 'number' ? val.toFixed(4) : toGLSL(val, coordVar);
    }

    return op.toGLSL({ args: resolvedArgs, coordVar });
}

export function toStructuredView(node: Node): TreeView {
    const operator = getOperator(node.type);
    const value = node.args.value;
    const hasValue = typeof value === 'number';
    const label = hasValue ? `const(${value})` : node.type;

    const treeView: TreeView = { label, type: node.type };

    if (hasValue) {
        treeView.value = value;
    }

    const childrenViews: TreeView[] = [];

    for (const name of operator.argNames) {
        const child = node.args[name];

        if (child && typeof child !== 'number') {
            childrenViews.push(toStructuredView(child));
        }
    }

    if (childrenViews.length > 0) {
        treeView.children = childrenViews;
    }

    return treeView;
}

const STRUCTURE_RNG_DEPTH = 3;

/** One tree per output channel; the channel is the key, so the two cannot drift apart. */
export type ChannelTrees = Record<Channel, Node>;

export interface BuildChannelTreesProps {
    seedText: string;
    rule: Rule;
    correlated?: boolean;
}

/**
 * Structural decisions come from a shared RNG, channel variation from per-channel RNGs — or a
 * single shared stream in `correlated` mode.
 */
export function buildChannelTrees({
    seedText,
    rule,
    correlated = false,
}: BuildChannelTreesProps): ChannelTrees {
    const pickRng =
        (structure: SeededRandom, channel: SeededRandom) =>
        (depth: number): SeededRandom =>
            depth < STRUCTURE_RNG_DEPTH ? structure : channel;

    const { structure, channels } = correlated
        ? createCorrelatedRng(seedText)
        : createDualRng(seedText, rule.maxDepth);

    const buildChannelTree = (channel: Channel): Node =>
        buildTree({
            rule,
            maxDepth: rule.maxDepth,
            pickRng: pickRng(structure, channels[channel]),
            seedText,
        });

    return {
        red: buildChannelTree('red'),
        green: buildChannelTree('green'),
        blue: buildChannelTree('blue'),
    };
}
