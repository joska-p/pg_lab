import type { Catalog } from '../catalog/index.ts';
import { createExpression, createNode } from './expression.ts';
import type { Expression, Node } from './types.ts';

/** Import guards (D35): checked while reading, so a hostile file never reaches the compiler. */
export const MAX_IMPORT_NODES = 5_000;
export const MAX_IMPORT_DEPTH = 64;

/** Plain JSON form of a node: `op` first, then optional `params` and `in` when non-empty. */
export interface NodeData {
    readonly op: string;
    readonly params?: readonly number[];
    readonly in?: readonly NodeData[];
}

export interface ExpressionData {
    readonly r: NodeData;
    readonly g: NodeData;
    readonly b: NodeData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function serializeNode(node: Node): NodeData {
    const data: { op: string; params?: number[]; in?: NodeData[] } = { op: node.operatorName };

    if (node.params.length > 0) {
        data.params = [...node.params];
    }

    if (node.inputs.length > 0) {
        data.in = node.inputs.map(serializeNode);
    }

    return data;
}

/** Canonical object form; equal expressions give equal data (fixed key order, no empty fields). */
export function serialize(expression: Expression): ExpressionData {
    return {
        r: serializeNode(expression.r),
        g: serializeNode(expression.g),
        b: serializeNode(expression.b),
    };
}

/**
 * Reads one node with a bounded recursion (MAX_IMPORT_DEPTH, checked before any node is built, so a
 * hostile file cannot overflow the stack) and a shared node counter (MAX_IMPORT_NODES counts the
 * whole expression, all three channels).
 */
function readNode(
    catalog: Catalog,
    data: unknown,
    path: string,
    depth: number,
    counters: { nodes: number },
): Node {
    if (depth > MAX_IMPORT_DEPTH) {
        throw new Error(
            `Expression invalid at ${path}: deeper than ${MAX_IMPORT_DEPTH} levels (import limit)`,
        );
    }

    if (!isRecord(data)) {
        throw new Error(`Expression invalid at ${path}: object expected`);
    }

    for (const key of Object.keys(data)) {
        if (key !== 'op' && key !== 'params' && key !== 'in') {
            throw new Error(`Expression invalid at ${path}: unknown field ${JSON.stringify(key)}`);
        }
    }

    const { op } = data;

    if (typeof op !== 'string') {
        throw new Error(`Expression invalid at ${path}: string expected at "op"`);
    }

    // Typed below: children and params are checked for type before being collected, so these
    // arrays only hold values `createNode` accepts.
    const rawParams: number[] = [];

    if (data.params !== undefined) {
        if (!Array.isArray(data.params)) {
            throw new Error(`Expression invalid at ${path}: array expected at "params"`);
        }

        for (const [index, value] of data.params.entries()) {
            if (typeof value !== 'number') {
                throw new Error(`Expression invalid at ${path}.params[${index}]: number expected`);
            }

            rawParams.push(value);
        }
    }

    const rawInputs: Node[] = [];

    if (data.in !== undefined) {
        if (!Array.isArray(data.in)) {
            throw new Error(`Expression invalid at ${path}: array expected at "in"`);
        }

        if (data.in.length > 0) {
            counters.nodes += data.in.length;

            if (counters.nodes > MAX_IMPORT_NODES) {
                throw new Error(
                    `Expression invalid at ${path}: more than ${MAX_IMPORT_NODES} nodes (import limit)`,
                );
            }

            for (const [index, child] of data.in.entries()) {
                rawInputs.push(
                    readNode(catalog, child, `${path}.in[${index}]`, depth + 1, counters),
                );
            }
        }
    }

    try {
        return createNode(catalog, op, rawInputs, rawParams);
    } catch (error) {
        throw new Error(
            `Expression invalid at ${path}: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error },
        );
    }
}

/**
 * Accepts unknown input and validates it through `createNode`; errors carry the precise address
 * (e.g. `Expression invalid at g.in[1]: ...`). Limits: MAX_IMPORT_NODES nodes in total,
 * MAX_IMPORT_DEPTH of depth per channel.
 */
export function deserialize(catalog: Catalog, data: unknown): Expression {
    if (!isRecord(data)) {
        throw new Error('Expression invalid: object expected');
    }

    for (const key of Object.keys(data)) {
        if (key !== 'r' && key !== 'g' && key !== 'b') {
            throw new Error(`Expression invalid: unknown field ${JSON.stringify(key)}`);
        }
    }

    const counters = { nodes: 0 };
    const r = readNode(catalog, data.r, 'r', 1, counters);
    const g = readNode(catalog, data.g, 'g', 1, counters);
    const b = readNode(catalog, data.b, 'b', 1, counters);

    return createExpression(r, g, b);
}
