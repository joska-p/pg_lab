import type { Catalog, OperatorDef } from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import type { Expression, Node } from '../expression/index.ts';
import { getVocabulary, minSize } from '../grammar/index.ts';
import type { Grammar } from '../grammar/index.ts';
import { createRng } from '../random/index.ts';
import type { Seed } from '../random/index.ts';

export const GENERATOR_VERSION = 1;

export function generate(catalog: Catalog, grammar: Grammar, seed: Seed): Expression {
    const rng = createRng(seed);
    const { minDepth, maxDepth, maxNodes } = grammar.constraints;

    const vocabulary: OperatorDef[] = getVocabulary(catalog, grammar.weights);

    function generateNode(
        currentDepth: number,
        budget: number,
    ): { readonly node: Node; readonly size: number } {
        // 1. Candidates
        const candidates = vocabulary.filter((operator) => {
            const k = operator.inputs.length;
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
        const operator = rng.weighted(candidates, (candidate) => grammar.weights[candidate.name]);

        // 4. Draw parameters
        const paramValues: number[] = [];
        if (operator.params) {
            for (const param of operator.params) {
                const u = rng.next();
                const raw = param.min + u * (param.max - param.min);
                const rounded = Math.round(raw * 1000) / 1000;
                const clamped = Math.min(param.max, Math.max(param.min, rounded));
                const normalized = Object.is(clamped, -0) || clamped === 0 ? 0 : clamped;
                paramValues.push(normalized);
            }
        }

        // 5. Children
        const k = operator.inputs.length;
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

        // 6. Construct node
        const node = createNode(catalog, operator.name, childNodes, paramValues);
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
