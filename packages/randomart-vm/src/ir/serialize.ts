import { isRecord } from '../shared/guards';
import { MAX_IMPORT_DEPTH, MAX_IMPORT_NODES } from '../spec/constants';
import { IrError } from '../spec/errors';
import { createExpression, createNode } from './ir';
import type { Expression, ExpressionData, Node, NodeData } from './types';

function serializeNode(node: Node): NodeData {
    return {
        op: node.op,
        ...(node.params.length > 0 && { params: [...node.params] }),
        ...(node.inputs.length > 0 && { in: node.inputs.map(serializeNode) }),
    };
}

export function serialize(expression: Expression): ExpressionData {
    return {
        r: serializeNode(expression.r),
        g: serializeNode(expression.g),
        b: serializeNode(expression.b),
    };
}

function readNode(data: unknown, path: string, depth: number, counters: { nodes: number }): Node {
    if (depth > MAX_IMPORT_DEPTH) {
        throw new IrError(`Expression invalid at ${path}: deeper than ${MAX_IMPORT_DEPTH} levels`);
    }
    if (!isRecord(data)) {
        throw new IrError(`Expression invalid at ${path}: object expected`);
    }
    for (const key of Object.keys(data)) {
        if (key !== 'op' && key !== 'params' && key !== 'in') {
            throw new IrError(
                `Expression invalid at ${path}: unknown field ${JSON.stringify(key)}`,
            );
        }
    }
    const { op } = data;
    if (typeof op !== 'string') {
        throw new IrError(`Expression invalid at ${path}: string expected at "op"`);
    }
    const rawParams: number[] = [];
    if (data.params !== undefined) {
        if (!Array.isArray(data.params)) {
            throw new IrError(`Expression invalid at ${path}: array expected at "params"`);
        }
        for (const [index, value] of data.params.entries()) {
            if (typeof value !== 'number') {
                throw new IrError(
                    `Expression invalid at ${path}.params[${index}]: number expected`,
                );
            }
            rawParams.push(value);
        }
    }
    const rawInputs: Node[] = [];
    if (data.in !== undefined) {
        if (!Array.isArray(data.in)) {
            throw new IrError(`Expression invalid at ${path}: array expected at "in"`);
        }
        if (data.in.length > 0) {
            counters.nodes += data.in.length;
            if (counters.nodes > MAX_IMPORT_NODES) {
                throw new IrError(
                    `Expression invalid at ${path}: more than ${MAX_IMPORT_NODES} nodes`,
                );
            }
            for (const [index, child] of data.in.entries()) {
                rawInputs.push(readNode(child, `${path}.in[${index}]`, depth + 1, counters));
            }
        }
    }
    try {
        return createNode(op, rawInputs, rawParams);
    } catch (error) {
        throw new IrError(
            `Expression invalid at ${path}: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error as Error },
        );
    }
}

export function deserialize(data: unknown): Expression {
    if (!isRecord(data)) {
        throw new IrError('Expression invalid: object expected');
    }
    for (const key of Object.keys(data)) {
        if (key !== 'r' && key !== 'g' && key !== 'b') {
            throw new IrError(`Expression invalid: unknown field ${JSON.stringify(key)}`);
        }
    }
    const counters = { nodes: 0 };
    const r = readNode(data.r, 'r', 1, counters);
    const g = readNode(data.g, 'g', 1, counters);
    const b = readNode(data.b, 'b', 1, counters);
    return createExpression(r, g, b);
}
