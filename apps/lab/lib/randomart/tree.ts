import { RandomArtError } from './errors';
import { getOp, isOpName } from './ops';
import type { OpName, ParamSpec } from './ops';

/** An immutable operator application. `params` are named so their meaning never depends on order. */
export interface Node {
    readonly op: OpName;
    readonly params: Readonly<Record<string, number>>;
    readonly inputs: readonly Node[];
}

/** One node per output channel. */
export interface Expression {
    readonly r: Node;
    readonly g: Node;
    readonly b: Node;
}

/** Serialized tree node; `params` and `in` are omitted when empty. */
export interface NodeData {
    readonly op: OpName;
    readonly params?: Readonly<Record<string, number>>;
    readonly in?: readonly NodeData[];
}

/** Serialized expression, the stable JSON form. */
export interface ExpressionData {
    readonly version: number;
    readonly r: NodeData;
    readonly g: NodeData;
    readonly b: NodeData;
}

const EXPRESSION_VERSION = 2;
const MAX_IMPORT_DEPTH = 64;
const MAX_IMPORT_NODES = 4096;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRecord(value: unknown, path: string): Record<string, unknown> {
    if (!isRecord(value)) {
        throw new RandomArtError(`Expression invalid at ${path}: object expected`);
    }
    return value;
}

function readFields(
    record: Record<string, unknown>,
    allowed: readonly string[],
    path: string,
): void {
    for (const key of Object.keys(record)) {
        if (!allowed.includes(key)) {
            throw new RandomArtError(
                `Expression invalid at ${path}: unknown field ${JSON.stringify(key)}`,
            );
        }
    }
}

/** Why `value` is not acceptable for `range`, or null when it is. */
function paramProblem(range: ParamSpec, value: unknown): string | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return `finite number expected, got ${String(value)}`;
    }
    if (value < range.min || value > range.max) {
        return `${value} out of [${range.min}, ${range.max}]`;
    }
    return null;
}

/** Narrows `value` to a finite number within `range`. */
function isValidParam(range: ParamSpec, value: unknown): value is number {
    return paramProblem(range, value) === null;
}

function readParams(op: OpName, value: unknown, path: string): Readonly<Record<string, number>> {
    const spec = getOp(op).params ?? {};
    if (value !== undefined && !isRecord(value)) {
        throw new RandomArtError(`Expression invalid at ${path}: object expected at "params"`);
    }
    const provided = value ?? {};

    for (const name of Object.keys(provided)) {
        if (!Object.hasOwn(spec, name)) {
            throw new RandomArtError(
                `Expression invalid at ${path}: operator "${op}" has no parameter "${name}"`,
            );
        }
    }

    const params: Record<string, number> = {};
    for (const [name, range] of Object.entries(spec)) {
        const raw = provided[name];
        if (raw === undefined) {
            throw new RandomArtError(
                `Expression invalid at ${path}: missing parameter "${name}" of "${op}"`,
            );
        }
        if (!isValidParam(range, raw)) {
            throw new RandomArtError(
                `Expression invalid at ${path}.params.${name}: ${paramProblem(range, raw)}`,
            );
        }
        params[name] = raw;
    }
    return params;
}

function normalizeParams(params: Readonly<Record<string, number>>): Record<string, number> {
    const normalized: Record<string, number> = {};
    for (const [name, value] of Object.entries(params)) {
        normalized[name] = value === 0 ? 0 : value;
    }
    return normalized;
}

export function createNode(
    op: OpName,
    inputs: readonly Node[] = [],
    params: Readonly<Record<string, number>> = {},
): Node {
    const opDef = getOp(op);
    const spec = opDef.params ?? {};

    // Arity assertion: catch invalid node constructions at creation time
    if (inputs.length !== opDef.arity) {
        throw new RandomArtError(
            `Operator "${op}" expects ${opDef.arity} input(s), got ${inputs.length}`,
        );
    }

    // Unknown parameters are rejected here too, mirroring deserialize.
    for (const name of Object.keys(params)) {
        if (!Object.hasOwn(spec, name)) {
            throw new RandomArtError(`Operator "${op}" has no parameter "${name}"`);
        }
    }

    // Parameter range assertion (step validation skipped here as it's only relevant for generation)
    for (const [name, range] of Object.entries(spec)) {
        const value = params[name];
        if (value === undefined) {
            throw new RandomArtError(`Operator "${op}" missing required parameter "${name}"`);
        }
        const problem = paramProblem(range, value);
        if (problem !== null) {
            throw new RandomArtError(`Operator "${op}" parameter "${name}": ${problem}`);
        }
    }

    return Object.freeze({
        op,
        params: Object.freeze(normalizeParams(params)),
        inputs: Object.freeze([...inputs]),
    });
}

export function createExpression(r: Node, g: Node, b: Node): Expression {
    return Object.freeze({ r, g, b });
}

/** `dx`, `dy`, then the body of a warp node. Arity is guaranteed by `createNode`. */
export function warpOperands(node: Node): readonly [Node, Node, Node] {
    const [dx, dy, body] = node.inputs;
    if (dx === undefined || dy === undefined || body === undefined) {
        throw new RandomArtError(`Warp "${node.op}" expects 3 inputs, got ${node.inputs.length}`);
    }
    return [dx, dy, body];
}

function readNode(value: unknown, path: string, depth: number, counter: { nodes: number }): Node {
    counter.nodes += 1;
    if (counter.nodes > MAX_IMPORT_NODES) {
        throw new RandomArtError(
            `Expression invalid at ${path}: more than ${MAX_IMPORT_NODES} nodes`,
        );
    }
    if (depth > MAX_IMPORT_DEPTH) {
        throw new RandomArtError(
            `Expression invalid at ${path}: deeper than ${MAX_IMPORT_DEPTH} levels`,
        );
    }
    const record = readRecord(value, path);
    readFields(record, ['op', 'params', 'in'], path);

    const op = record.op;
    if (!isOpName(op)) {
        throw new RandomArtError(`Expression invalid at ${path}: unknown operator ${String(op)}`);
    }
    const params = readParams(op, record.params, path);
    const { arity } = getOp(op);

    const raw = record.in;
    if (raw === undefined) {
        if (arity > 0) {
            throw new RandomArtError(
                `Expression invalid at ${path}: ${arity} input(s) expected at "in"`,
            );
        }
        return createNode(op, [], params);
    }
    if (!Array.isArray(raw)) {
        throw new RandomArtError(`Expression invalid at ${path}: array expected at "in"`);
    }
    if (raw.length !== arity) {
        throw new RandomArtError(
            `Expression invalid at ${path}: ${arity} input(s) expected, got ${raw.length}`,
        );
    }

    const inputs = raw.map((child, index) =>
        readNode(child, `${path}.in[${index}]`, depth + 1, counter),
    );
    return createNode(op, inputs, params);
}

function serializeNode(node: Node): NodeData {
    return {
        op: node.op,
        ...(Object.keys(node.params).length > 0 && { params: { ...node.params } }),
        ...(node.inputs.length > 0 && { in: node.inputs.map(serializeNode) }),
    };
}

export function serialize(expression: Expression): ExpressionData {
    return {
        version: EXPRESSION_VERSION,
        r: serializeNode(expression.r),
        g: serializeNode(expression.g),
        b: serializeNode(expression.b),
    };
}

function formatNumber(value: number): string {
    return String(value === 0 ? 0 : value);
}

function formatNodeLabel(node: Node): string {
    const params = Object.entries(node.params);
    if (params.length === 0) {
        return node.op;
    }
    const formatted = params.map(([name, value]) => `${name}=${formatNumber(value)}`);
    return `${node.op}(${formatted.join(', ')})`;
}

/** `add(sin(x(amp=0.3)), const(value=0.5))`, with non-terminals elided past `maxDepth`. */
export function formatFormula(node: Node, maxDepth: number = Number.POSITIVE_INFINITY): string {
    const label = formatNodeLabel(node);
    if (node.inputs.length === 0) {
        return label;
    }
    if (maxDepth <= 0) {
        return `${label}(…)`;
    }
    const inputs = node.inputs.map((child) => formatFormula(child, maxDepth - 1));
    return `${label}(${inputs.join(', ')})`;
}

function nodeUsesTime(node: Node): boolean {
    if (getOp(node.op).usesTime?.(node.params) === true) {
        return true;
    }
    return node.inputs.some(nodeUsesTime);
}

/** True when the tree reads `u_phase` for at least one node. */
export function usesTime(expression: Expression): boolean {
    return [expression.r, expression.g, expression.b].some(nodeUsesTime);
}

function sameNode(a: Node, b: Node): boolean {
    if (a === b) {
        return true;
    }
    if (a.op !== b.op || a.inputs.length !== b.inputs.length) {
        return false;
    }
    const names = Object.keys(a.params);
    if (names.length !== Object.keys(b.params).length) {
        return false;
    }
    if (names.some((name) => a.params[name] !== b.params[name])) {
        return false;
    }
    return a.inputs.every((child, index) => {
        const other = b.inputs[index];
        return other !== undefined && sameNode(child, other);
    });
}

/** True when the three channels are the same tree, whatever the grammar allowed. */
export function isMonoExpression(expression: Expression): boolean {
    return sameNode(expression.r, expression.g) && sameNode(expression.g, expression.b);
}

/**
 * Read an untrusted JSON expression. This is the only place where shape, arity and parameter ranges
 * are checked; values produced by `createNode` are trusted.
 */
export function deserialize(data: unknown): Expression {
    const record = readRecord(data, 'expression');
    readFields(record, ['version', 'r', 'g', 'b'], 'expression');

    const version = record.version;
    if (version !== EXPRESSION_VERSION) {
        throw new RandomArtError(
            `Expression invalid: version mismatch — expected ${EXPRESSION_VERSION}, got ${String(version)}`,
        );
    }

    const counter = { nodes: 0 };
    const read = (value: unknown, path: string, depth: number): Node =>
        readNode(value, path, depth, counter);

    return createExpression(read(record.r, 'r', 1), read(record.g, 'g', 1), read(record.b, 'b', 1));
}
