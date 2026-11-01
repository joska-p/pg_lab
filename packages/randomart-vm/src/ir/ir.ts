import { IrError } from '../spec/errors';
import type { Expression, Node } from './types';

export function createNode(
    op: string,
    inputs: readonly Node[] = [],
    params: readonly number[] = [],
): Node {
    if (typeof op !== 'string' || op.length === 0) {
        throw new IrError('Node op must be non-empty string');
    }
    if (!Array.isArray(inputs)) {
        throw new IrError('Node inputs must be array');
    }
    if (!Array.isArray(params)) {
        throw new IrError('Node params must be array');
    }
    for (let i = 0; i < params.length; i++) {
        const v = params[i];
        if (typeof v !== 'number' || !Number.isFinite(v)) {
            throw new IrError(`Node param ${i} must be finite number`);
        }
    }
    // normalize -0
    const normalized = params.map((p) => (Object.is(p, -0) || p === 0 ? 0 : p));
    return Object.freeze({
        op,
        params: Object.freeze(normalized),
        inputs: Object.freeze([...inputs]),
    }) as Node;
}

export function createExpression(r: Node, g: Node, b: Node): Expression {
    if (!r || typeof (r as any).op !== 'string') {
        throw new IrError('Expression.r must be valid Node');
    }
    if (!g || typeof (g as any).op !== 'string') {
        throw new IrError('Expression.g must be valid Node');
    }
    if (!b || typeof (b as any).op !== 'string') {
        throw new IrError('Expression.b must be valid Node');
    }
    return Object.freeze({ r, g, b }) as Expression;
}

export function nodeCount(target: Node | Expression): number {
    if ('r' in target && 'g' in target && 'b' in target) {
        const expr = target as Expression;
        return nodeCount(expr.r) + nodeCount(expr.g) + nodeCount(expr.b);
    }
    const node = target as Node;
    let count = 1;
    for (const child of node.inputs) {
        count += nodeCount(child);
    }
    return count;
}

export function depth(node: Node): number {
    if (node.inputs.length === 0) {
        return 1;
    }
    let max = 0;
    for (const child of node.inputs) {
        const d = depth(child);
        if (d > max) {
            max = d;
        }
    }
    return 1 + max;
}
