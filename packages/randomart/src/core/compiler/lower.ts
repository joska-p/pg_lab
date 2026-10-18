/**
 * Lower.ts — DAG lowering pass.
 *
 * Multiplicities are owned by `Operator` (probed once, at catalog construction), so lowering only
 * walks the three-channel expression into a shared DAG and interned coordinate contexts.
 *
 * Vocabulary: a _node_ is an element of an expression tree; a _vertex_ is an entry of the shared
 * DAG (key = context, operator, params, input ids); a _value_ is a number in [-1, 1]. A terminal
 * that does not depend on coordinates is duplicated per context; harmless, the driver folds
 * constants.
 */

import type { Catalog } from '../catalog/index.ts';
import type { Expression, Node } from '../expression/index.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A vertex in the lowered DAG. Created once per unique (context, operatorName, params, inputIds)
 * key.
 */
export interface Vertex {
    /** Stable sequential id, assigned in topological order (children before parents). */
    readonly id: number;
    /** Operator name. */
    readonly operatorName: string;
    /** Operator params. */
    readonly params: readonly number[];
    /** Ids of child vertices, in input order. */
    readonly inputIds: readonly number[];
    /** Coordinate context ('root' or 'c1', 'c2', ...). */
    readonly context: string;
    /** Operator `requires` deps accumulated from this node. */
    readonly requires: readonly string[];
}

/** A child coordinate context definition created by a transformer operator. */
export interface ContextDef {
    /** Stable sequential context id (1, 2, ...). */
    readonly id: number;
    /** Context GLSL variable name: 'c1', 'c2', ... */
    readonly name: string;
    /** Parent context name: 'root' or 'c1', ... */
    readonly parentName: string;
    /** Operator that generated this context (e.g. 'warp'). */
    readonly operatorName: string;
    /** Parameters of the operator. */
    readonly params: readonly number[];
    /** Vertex ids of 'current' inputs that compute the coordinates. */
    readonly currentInputIds: readonly number[];
    /** Dependencies required by this operator (e.g. ['ra_fold2']). */
    readonly requires: readonly string[];
}

/** An item in the topographically ordered execution program. */
export type ProgramItem =
    | { readonly kind: 'vertex'; readonly vertex: Vertex }
    | { readonly kind: 'context'; readonly context: ContextDef };

export interface LowerResult {
    /** All vertices in topological order (children before parents). */
    readonly vertices: readonly Vertex[];
    /** All child coordinate contexts created in topological order. */
    readonly contexts: readonly ContextDef[];
    /** Sequential program of contexts and vertices in strict dependency order. */
    readonly program: readonly ProgramItem[];
    /** Usages[id] = number of times vertex `id` contributes to written GLSL text. */
    readonly usages: readonly number[];
    /** Vertex ids for the three output channels [r, g, b]. */
    readonly roots: readonly [number, number, number];
}

export const ROOT_CTX = 'root';

// ---------------------------------------------------------------------------
// Lowering — with interned coordinate contexts
// ---------------------------------------------------------------------------

/** Lowers the three-channel expression into a shared DAG vertex table and interned contexts. */
export function lower(catalog: Catalog, expression: Expression): LowerResult {
    const vertices: Vertex[] = [];
    const contexts: ContextDef[] = [];
    const program: ProgramItem[] = [];
    const usages: number[] = [];
    const vertexMap = new Map<string, number>(); // key → vertex id
    const contextMap = new Map<string, string>(); // key → context name

    let nextVertexId = 0;
    let nextContextId = 1;

    function lowerNode(node: Node, contextName: string): number {
        const { operatorName, params, inputs } = node;
        const operator = catalog.operator(operatorName);
        const paramsStr = params.join(',');

        // 1. `current` inputs come first, in the current context.
        const currentIds = inputs
            .slice(0, operator.currentCount)
            .map((child) => lowerNode(child, contextName));

        // 2. `inner` inputs live in the interned context created by `coords`.
        let innerContext = contextName;

        if (operator.hasInner) {
            const contextKey = `${contextName}|${operatorName}[${paramsStr}](${currentIds.join(',')})`;
            const known = contextMap.get(contextKey);

            if (known === undefined) {
                const id = nextContextId++;

                innerContext = `c${id}`;
                contextMap.set(contextKey, innerContext);

                // Coordinates multiplicity: counted once per context created, not per reference.
                currentIds.forEach((inputId, j) => {
                    usages[inputId] = (usages[inputId] ?? 0) + operator.coordsMultiplicity(j);
                });

                const contextDef: ContextDef = {
                    id,
                    name: innerContext,
                    parentName: contextName,
                    operatorName,
                    params,
                    currentInputIds: Object.freeze([...currentIds]),
                    requires: [...operator.requires],
                };

                contexts.push(contextDef);
                program.push({ kind: 'context', context: contextDef });
            } else {
                innerContext = known;
            }
        }

        const innerIds = inputs
            .slice(operator.currentCount)
            .map((child) => lowerNode(child, innerContext));
        const allInputIds = [...currentIds, ...innerIds];

        // 3. Hash-consing.
        const vertexKey = `${contextName}|${operatorName}[${paramsStr}](${allInputIds.join(',')})`;
        const existing = vertexMap.get(vertexKey);

        if (existing !== undefined) {
            return existing;
        }

        const id = nextVertexId++;

        allInputIds.forEach((inputId, i) => {
            usages[inputId] = (usages[inputId] ?? 0) + operator.multiplicity(i);
        });

        const vertex: Vertex = {
            id,
            operatorName,
            params,
            inputIds: Object.freeze(allInputIds),
            context: contextName,
            requires: [...operator.requires],
        };

        vertices.push(vertex);
        usages[id] ??= 0;
        vertexMap.set(vertexKey, id);
        program.push({ kind: 'vertex', vertex });

        return id;
    }

    const roots = [expression.r, expression.g, expression.b].map((root) =>
        lowerNode(root, ROOT_CTX),
    ) as [number, number, number];

    for (const rootId of roots) {
        usages[rootId] = (usages[rootId] ?? 0) + 1;
    }

    return {
        vertices: Object.freeze(vertices),
        contexts: Object.freeze(contexts),
        program: Object.freeze(program),
        usages: Object.freeze(usages),
        roots,
    };
}
