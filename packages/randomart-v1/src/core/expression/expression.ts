import type { Catalog } from '../catalog/types';
import { assertFinite } from '../shared/shared';
import type { Expression, Node } from './types';

export function createNode(
    catalog: Catalog,
    operatorName: string,
    inputs: readonly Node[] = [],
    params: readonly number[] = [],
): Node {
    const operator = catalog.operator(operatorName);

    if (inputs.length !== operator.arity) {
        throw new Error(
            `Operator "${operatorName}" expects ${operator.arity} inputs, received ${inputs.length}`,
        );
    }

    const expectedParams = operator.params;
    if (params.length !== expectedParams.length) {
        throw new Error(
            `Operator "${operatorName}" expects ${expectedParams.length} params, received ${params.length}`,
        );
    }

    const normalizedParams: number[] = [];
    for (let i = 0; i < params.length; i++) {
        const val = params[i];
        const { name, min, max, step } = expectedParams[i];

        assertFinite(val, `Param ${name} of operator "${operatorName}"`);

        if (val < min || val > max) {
            throw new Error(
                `Param "${name}" of operator "${operatorName}" out of range: ${val} not in [${min}, ${max}]`,
            );
        }

        // Stepped params live on the grid min + k*step: an off-grid value is refused, not rounded.
        if (step !== undefined) {
            const index = (val - min) / step;

            if (Math.abs(index - Math.round(index)) > 1e-9) {
                throw new Error(
                    `Param "${name}" of operator "${operatorName}" must be on the grid ${min} + k*${step}, received ${val}`,
                );
            }
        }

        normalizedParams.push(Object.is(val, -0) || val === 0 ? 0 : val);
    }

    return Object.freeze({
        operatorName,
        params: Object.freeze(normalizedParams),
        inputs: Object.freeze([...inputs]),
    }) as Node;
}

export function createExpression(r: Node, g: Node, b: Node): Expression {
    if (!r || typeof r.operatorName !== 'string') {
        throw new Error('Channel "r" must be a valid Node');
    }
    if (!g || typeof g.operatorName !== 'string') {
        throw new Error('Channel "g" must be a valid Node');
    }
    if (!b || typeof b.operatorName !== 'string') {
        throw new Error('Channel "b" must be a valid Node');
    }

    return Object.freeze({
        r,
        g,
        b,
    }) as Expression;
}

export function nodeCount(target: Node | Expression): number {
    if ('r' in target && 'g' in target && 'b' in target) {
        return nodeCount(target.r) + nodeCount(target.g) + nodeCount(target.b);
    }
    let count = 1;
    for (const child of target.inputs) {
        count += nodeCount(child);
    }
    return count;
}

export function depth(node: Node): number {
    if (node.inputs.length === 0) {
        return 1;
    }
    let maxChildDepth = 0;
    for (const child of node.inputs) {
        const childDepth = depth(child);
        if (childDepth > maxChildDepth) {
            maxChildDepth = childDepth;
        }
    }
    return 1 + maxChildDepth;
}
