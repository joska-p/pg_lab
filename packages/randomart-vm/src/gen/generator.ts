import { constraintsOf, getVocabulary, weightOf } from '../grammar/grammar';
import type { Grammar } from '../grammar/types';
import { createExpression, createNode } from '../ir/ir';
import type { Expression, Node } from '../ir/types';
import type { Catalog } from '../isa/catalog';
import type { IsaOperator } from '../isa/types';
import { createRng } from '../rng/rng';
import { seedToNumber } from '../rng/seed';
import type { Seed } from '../rng/types';
import { GenError } from '../spec/errors';
import { PARAM_DECIMALS } from './constants';

const PARAM_SCALE = 10 ** PARAM_DECIMALS;

interface GenResult {
    node: Node;
    size: number;
}

interface TrunkResult {
    nodes: readonly [Node, Node, Node];
    size: number;
    shared: boolean;
}

function minSize(depth: number, minDepth: number, vocab: IsaOperator[]): number {
    if (depth >= minDepth) {
        return 1;
    }
    const nonTerm = vocab.filter((o) => !o.isTerminal);
    if (nonTerm.length === 0) {
        return 1;
    }
    let k = Infinity;
    for (const o of nonTerm) {
        if (o.arity < k) {
            k = o.arity;
        }
    }
    if (k === Infinity) {
        return 1;
    }
    return 1 + k * minSize(depth + 1, minDepth, vocab);
}

export function generate(
    catalog: Catalog,
    grammar: Grammar,
    seed: Seed | number | string,
): Expression {
    const rng = createRng(
        typeof seed === 'object' && seed !== null && 'brand' in seed
            ? seedToNumber(seed as Seed)
            : seed,
    );
    const { minDepth, maxDepth, maxNodes } = constraintsOf(grammar.size);
    const shareDepth = grammar.shareDepth;
    const vocab = getVocabulary(catalog, grammar.weights);

    function drawOperator(depth: number, budget: number): IsaOperator {
        const candidates: IsaOperator[] = [];
        for (const op of vocab) {
            const k = op.arity;
            if (k === 0) {
                if (depth >= minDepth) {
                    candidates.push(op);
                }
                continue;
            }
            if (depth < maxDepth) {
                const need = 1 + k * minSize(depth + 1, minDepth, vocab);
                if (need <= budget) {
                    candidates.push(op);
                }
            }
        }
        if (candidates.length === 0) {
            throw new GenError(`No candidates at depth ${depth} budget ${budget}`);
        }
        // deterministic tie by name not necessary; weighted is enough
        return rng.weighted(candidates, (c) => weightOf(grammar.weights, c.name));
    }

    function drawContinuous(min: number, max: number): number {
        const raw = min + rng.next() * (max - min);
        const rounded = Math.round(raw * PARAM_SCALE) / PARAM_SCALE;
        let v = rounded;
        if (v < min) {
            v = min;
        }
        if (v > max) {
            v = max;
        }
        if (Object.is(v, -0) || v === 0) {
            return 0;
        }
        return v;
    }

    function drawStepped(min: number, max: number, step: number): number {
        const levels = Math.round((max - min) / step) + 1;
        if (levels <= 1) {
            return min;
        }
        const idx = rng.int(levels);
        const v = min + idx * step;
        if (Object.is(v, -0) || v === 0) {
            return 0;
        }
        return v;
    }

    function drawParams(op: IsaOperator): number[] {
        const out: number[] = [];
        for (const p of op.params) {
            if (p.step !== undefined) {
                out.push(drawStepped(p.min, p.max, p.step));
            } else {
                out.push(drawContinuous(p.min, p.max));
            }
        }
        return out;
    }

    function buildChildren<T extends { size: number }>(
        depth: number,
        budget: number,
        k: number,
        build: (b: number) => T,
    ): T[] {
        const m = minSize(depth + 1, minDepth, vocab);
        let remaining = budget - 1 - k * m;
        const children: T[] = [];
        for (let i = 0; i < k; i++) {
            const childBudget = m + Math.floor(remaining / Math.max(1, k - i));
            const child = build(childBudget);
            children.push(child);
            remaining -= child.size - m;
        }
        return children;
    }

    function generateNode(depth: number, budget: number): GenResult {
        const op = drawOperator(depth, budget);
        const params = drawParams(op);
        const children =
            op.arity > 0
                ? buildChildren(depth, budget, op.arity, (b) => generateNode(depth + 1, b))
                : [];
        const node = createNode(
            op.name,
            children.map((c) => c.node),
            params,
        );
        const size = 1 + children.reduce((s, c) => s + c.size, 0);
        return { node, size };
    }

    function generateTrunk(depth: number, budget: number): TrunkResult {
        if (depth > shareDepth) {
            const r = generateNode(depth, budget);
            const g = generateNode(depth, budget);
            const b = generateNode(depth, budget);
            return {
                nodes: [r.node, g.node, b.node],
                size: Math.max(r.size, g.size, b.size),
                shared: false,
            };
        }
        const op = drawOperator(depth, budget);
        const params = drawParams(op);
        const childResults =
            op.arity > 0
                ? buildChildren(depth, budget, op.arity, (b) => generateTrunk(depth + 1, b))
                : [];
        const size = 1 + childResults.reduce((s, c) => s + c.size, 0);
        const childrenAt = (ch: number): Node[] => childResults.map((c) => c.nodes[ch]);
        if (childResults.length > 0 && childResults.every((c) => c.shared)) {
            const node = createNode(op.name, childrenAt(0), params);
            return { nodes: [node, node, node], size, shared: true };
        }
        return {
            nodes: [
                createNode(op.name, childrenAt(0), params),
                createNode(op.name, childrenAt(1), params),
                createNode(op.name, childrenAt(2), params),
            ],
            size,
            shared: false,
        };
    }

    const roots = generateTrunk(1, maxNodes);
    return createExpression(roots.nodes[0], roots.nodes[1], roots.nodes[2]);
}
