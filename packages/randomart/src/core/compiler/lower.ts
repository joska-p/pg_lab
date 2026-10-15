/**
 * Lower.ts — DAG lowering pass (spec §5.0 + §5.1).
 *
 * Probes each operator for input multiplicities (glsl and innerCoords), then lowers the
 * three-channel expression into a shared DAG and interned coordinate contexts.
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

// ---------------------------------------------------------------------------
// Multiplicity probing (spec §5.0)
// ---------------------------------------------------------------------------

export const ROOT_CTX = 'root';

/** Counts occurrences of `needle` in `haystack`. Used to compute multiplicities during probing. */
function countOccurrences(haystack: string, needle: string): number {
    let count = 0;
    let pos = 0;
    while ((pos = haystack.indexOf(needle, pos)) !== -1) {
        count++;
        pos += needle.length;
    }
    return count;
}

/**
 * Returns mg[i] = number of times input i appears in the operator's glsl output. Called once per
 * (operatorName, params) combination; result is stable.
 */
export function probeMultiplicities(
    catalog: Catalog,
    operatorName: string,
    params: readonly number[],
): number[] {
    const operator = catalog.operator(operatorName);
    if (operator.inputs.length === 0) {
        return [];
    }
    const sentinels = operator.inputs.map((_, i) => `@${i}@`);
    const result = operator.glsl(sentinels, params, { p: '@p@' });
    return sentinels.map((s) => countOccurrences(result, s));
}

/**
 * Returns mc[i] = number of times current input i appears in operator's innerCoords output. Called
 * once per (operatorName, params) combination when the operator has inner inputs.
 */
export function probeInnerMultiplicities(
    catalog: Catalog,
    operatorName: string,
    params: readonly number[],
): number[] {
    const operator = catalog.operator(operatorName);
    if (typeof operator.innerCoords !== 'function') {
        return [];
    }
    const currentInputs = operator.inputs.filter((i) => i.scope !== 'inner');
    if (currentInputs.length === 0) {
        return [];
    }
    const sentinels = currentInputs.map((_, i) => `@c${i}@`);
    const result = operator.innerCoords(sentinels, params, { p: '@p@' });
    return sentinels.map((s) => countOccurrences(result, s));
}

// ---------------------------------------------------------------------------
// Lowering (spec §5.1) — with interned coordinate contexts
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
        const hasInner = operator.inputs.some((i) => i.scope === 'inner');

        const paramsStr = params.join(',');

        let childContextName = contextName;
        const currentInputIds: number[] = [];
        const innerInputIds: number[] = [];

        // 1. Lower 'current' inputs in the current context
        for (let i = 0; i < inputs.length; i++) {
            if (operator.inputs[i].scope !== 'inner') {
                currentInputIds.push(lowerNode(inputs[i], contextName));
            }
        }

        // 2. If operator has inner inputs, intern/create coordinate context
        if (hasInner) {
            const contextKey = `${contextName}|${operatorName}[${paramsStr}](${currentInputIds.join(',')})`;
            if (contextMap.has(contextKey)) {
                childContextName = contextMap.get(contextKey)!;
            } else {
                const ctxId = nextContextId++;
                childContextName = `c${ctxId}`;
                contextMap.set(contextKey, childContextName);

                // Accumulate mc usages for current inputs on context creation
                const mc = probeInnerMultiplicities(catalog, operatorName, params);
                for (let j = 0; j < currentInputIds.length; j++) {
                    const inputId = currentInputIds[j];
                    usages[inputId] = (usages[inputId] ?? 0) + (mc[j] ?? 1);
                }

                const contextDef: ContextDef = {
                    id: ctxId,
                    name: childContextName,
                    parentName: contextName,
                    operatorName,
                    params,
                    currentInputIds: Object.freeze([...currentInputIds]),
                    requires: operator.requires ? [...operator.requires] : [],
                };
                contexts.push(contextDef);
                program.push({ kind: 'context', context: contextDef });
            }

            // Lower 'inner' inputs in the new/interned context
            for (let i = 0; i < inputs.length; i++) {
                if (operator.inputs[i].scope === 'inner') {
                    innerInputIds.push(lowerNode(inputs[i], childContextName));
                }
            }
        }

        // 3. Assemble all child vertex ids in original operator input order
        let currentIdx = 0;
        let innerIdx = 0;
        const allInputIds: number[] = [];
        for (let i = 0; i < inputs.length; i++) {
            if (operator.inputs[i].scope === 'inner') {
                allInputIds.push(innerInputIds[innerIdx++]);
            } else {
                allInputIds.push(currentInputIds[currentIdx++]);
            }
        }

        // 4. Hash-cons / deduplicate vertex
        const vertexKey = `${contextName}|${operatorName}[${paramsStr}](${allInputIds.join(',')})`;
        if (vertexMap.has(vertexKey)) {
            return vertexMap.get(vertexKey)!;
        }

        // Create new vertex
        const id = nextVertexId++;
        const mg = probeMultiplicities(catalog, operatorName, params);

        // Accumulate mg usages for children
        for (let i = 0; i < allInputIds.length; i++) {
            const inputId = allInputIds[i];
            usages[inputId] = (usages[inputId] ?? 0) + (mg[i] ?? 1);
        }

        const vertex: Vertex = {
            id,
            operatorName,
            params,
            inputIds: Object.freeze(allInputIds),
            context: contextName,
            requires: operator.requires ? [...operator.requires] : [],
        };
        vertices.push(vertex);
        usages[id] = usages[id] ?? 0;
        vertexMap.set(vertexKey, id);
        program.push({ kind: 'vertex', vertex });

        return id;
    }

    const rId = lowerNode(expression.r, ROOT_CTX);
    const gId = lowerNode(expression.g, ROOT_CTX);
    const bId = lowerNode(expression.b, ROOT_CTX);

    // Each channel root contributes 1 usage (spec §5.1 post-lowering step)
    usages[rId] = (usages[rId] ?? 0) + 1;
    usages[gId] = (usages[gId] ?? 0) + 1;
    usages[bId] = (usages[bId] ?? 0) + 1;

    return {
        vertices: Object.freeze(vertices),
        contexts: Object.freeze(contexts),
        program: Object.freeze(program),
        usages: Object.freeze(usages),
        roots: [rId, gId, bId],
    };
}
