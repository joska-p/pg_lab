import { ops } from './ops';
import type { OpName } from './ops';
import type { Expression, Node } from './tree';

export interface LoweredVertex {
    readonly id: number;
    readonly op: OpName;
    readonly params: Readonly<Record<string, number>>;
    readonly inputs: readonly number[];
    readonly context: number;
}

/** A warp creates a nested coordinate frame consumed by the vertices lowered in it. */
export interface LoweredContext {
    readonly id: number;
    readonly parent: number;
    /** The warp operator; `inputs` holds its two offsets, evaluated in the parent frame. */
    readonly op: OpName;
    readonly params: Readonly<Record<string, number>>;
    readonly inputs: readonly [number, number];
}

export type LoweringStep =
    | { readonly kind: 'vertex'; readonly vertex: LoweredVertex }
    | { readonly kind: 'context'; readonly context: LoweredContext };

export interface LoweredDag {
    readonly roots: readonly [number, number, number];
    /** Topological order: every step only references ids emitted before it. */
    readonly steps: readonly LoweringStep[];
    readonly usages: ReadonlyMap<number, number>;
}

const ROOT_CONTEXT = 0;

function paramsKey(params: Readonly<Record<string, number>>): string {
    return Object.keys(params)
        .sort()
        .map((name) => `${name}=${params[name]}`)
        .join(',');
}

/**
 * Flatten an expression into a DAG: structurally equal subtrees (including their coordinate
 * context) share one vertex, and each vertex counts how many times it is used. Warp nodes create a
 * context instead of a vertex; their value is the body they wrap.
 */
export function lower(expression: Expression): LoweredDag {
    const steps: LoweringStep[] = [];
    const usages = new Map<number, number>();
    const vertexIds = new Map<string, number>();
    const contextIds = new Map<string, number>();
    let nextVertexId = 0;
    let nextContextId = 1;

    function addUsage(id: number): void {
        usages.set(id, (usages.get(id) ?? 0) + 1);
    }

    function lowerNode(node: Node, context: number): number {
        const op = ops[node.op];

        if (op.kind === 'warp') {
            // Arity is guaranteed by createNode.
            const [dxNode, dyNode, bodyNode] = node.inputs;
            const dx = lowerNode(dxNode, context);
            const dy = lowerNode(dyNode, context);

            const key = `${context}|${node.op}|${paramsKey(node.params)}|${dx},${dy}`;
            let inner = contextIds.get(key);
            if (inner === undefined) {
                inner = nextContextId++;
                contextIds.set(key, inner);
                steps.push({
                    kind: 'context',
                    context: {
                        id: inner,
                        parent: context,
                        op: node.op,
                        params: node.params,
                        inputs: [dx, dy],
                    },
                });
                addUsage(dx);
                addUsage(dy);
            }

            return lowerNode(bodyNode, inner);
        }

        const inputs = node.inputs.map((child) => lowerNode(child, context));
        const key = `${context}|${node.op}|${paramsKey(node.params)}|${inputs.join(',')}`;
        const known = vertexIds.get(key);
        if (known !== undefined) {
            return known;
        }

        const id = nextVertexId++;
        vertexIds.set(key, id);
        steps.push({
            kind: 'vertex',
            vertex: { id, op: node.op, params: node.params, inputs, context },
        });
        for (const input of inputs) {
            addUsage(input);
        }
        return id;
    }

    const roots: [number, number, number] = [
        lowerNode(expression.r, ROOT_CONTEXT),
        lowerNode(expression.g, ROOT_CONTEXT),
        lowerNode(expression.b, ROOT_CONTEXT),
    ];
    for (const root of roots) {
        addUsage(root);
    }

    return { roots, steps, usages };
}
