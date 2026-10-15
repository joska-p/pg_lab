import type { Catalog, OperatorDef } from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import type { Expression, Node } from '../expression/index.ts';
import { minSize } from '../grammar/index.ts';
import type { Grammar } from '../grammar/index.ts';
import { createRng } from '../random/index.ts';
import type { Seed } from '../random/index.ts';

export const GENERATOR_VERSION = 1;

export function generate(catalog: Catalog, grammar: Grammar, seed: Seed): Expression {
    const rng = createRng(seed);
    const { minDepth, maxDepth, maxNodes } = grammar.constraints;

    const vocabOps: OperatorDef[] = Object.keys(grammar.weights).map((name) =>
        catalog.operator(name),
    );

    function generateNode(
        d: number,
        budget: number,
    ): { readonly node: Node; readonly size: number } {
        // 1. Candidates
        const candidates = vocabOps.filter((op) => {
            const k = op.inputs.length;
            if (k === 0) {
                return d >= minDepth;
            }
            return d < maxDepth && 1 + k * minSize(d + 1, minDepth, vocabOps) <= budget;
        });

        if (candidates.length === 0) {
            throw new Error(
                `Generator error: no candidates found at depth ${d} with budget ${budget}`,
            );
        }

        // 2. Sort candidates alphabetically by name
        candidates.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        // 3. Draw candidate operator
        const op = rng.weighted(candidates, (candidate) => grammar.weights[candidate.name]);

        // 4. Draw parameters
        const paramValues: number[] = [];
        if (op.params) {
            for (const param of op.params) {
                const u = rng.next();
                const raw = param.min + u * (param.max - param.min);
                const rounded = Math.round(raw * 1000) / 1000;
                const clamped = Math.min(param.max, Math.max(param.min, rounded));
                const normalized = Object.is(clamped, -0) || clamped === 0 ? 0 : clamped;
                paramValues.push(normalized);
            }
        }

        // 5. Children
        const k = op.inputs.length;
        const childNodes: Node[] = [];
        let totalChildSize = 0;

        if (k > 0) {
            const m = minSize(d + 1, minDepth, vocabOps);
            let libre = budget - 1 - k * m;

            for (let i = 0; i < k; i++) {
                const childBudget = m + Math.floor(libre / (k - i));
                const childResult = generateNode(d + 1, childBudget);
                childNodes.push(childResult.node);
                totalChildSize += childResult.size;
                libre -= childResult.size - m;
            }
        }

        // 6. Construct node
        const node = createNode(catalog, op.name, childNodes, paramValues);
        return {
            node,
            size: 1 + totalChildSize,
        };
    }

    const r = generateNode(1, maxNodes).node;
    const g = generateNode(1, maxNodes).node;
    const b = generateNode(1, maxNodes).node;

    return createExpression(r, g, b);
}
