import type { Catalog } from '../catalog/index.ts';
import { assertFinite } from '../shared/index.ts';
import type { Expression, Node } from './types.ts';

export function createNode(
    catalog: Catalog,
    op: string,
    inputs: readonly Node[] = [],
    params: readonly number[] = [],
): Node {
    const opDef = catalog.operator(op);

    if (inputs.length !== opDef.inputs.length) {
        throw new Error(
            `Operator "${op}" expects ${opDef.inputs.length} inputs, received ${inputs.length}`,
        );
    }

    const expectedParams = opDef.params ?? [];
    if (params.length !== expectedParams.length) {
        throw new Error(
            `Operator "${op}" expects ${expectedParams.length} params, received ${params.length}`,
        );
    }

    const normalizedParams: number[] = [];
    for (let i = 0; i < params.length; i++) {
        const val = params[i];
        assertFinite(val, `Param ${expectedParams[i].name} of operator "${op}"`);
        if (val < expectedParams[i].min || val > expectedParams[i].max) {
            throw new Error(
                `Param "${expectedParams[i].name}" of operator "${op}" out of range: ${val} not in [${expectedParams[i].min}, ${expectedParams[i].max}]`,
            );
        }
        normalizedParams.push(Object.is(val, -0) || val === 0 ? 0 : val);
    }

    return Object.freeze({
        op,
        params: Object.freeze(normalizedParams),
        inputs: Object.freeze([...inputs]),
    }) as Node;
}

export function createExpression(r: Node, g: Node, b: Node): Expression {
    if (!r || typeof r.op !== 'string') {
        throw new Error('Channel "r" must be a valid Node');
    }
    if (!g || typeof g.op !== 'string') {
        throw new Error('Channel "g" must be a valid Node');
    }
    if (!b || typeof b.op !== 'string') {
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
        const d = depth(child);
        if (d > maxChildDepth) {
            maxChildDepth = d;
        }
    }
    return 1 + maxChildDepth;
}
