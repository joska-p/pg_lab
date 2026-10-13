/**
 * Lower.ts — DAG lowering pass (spec §5.0 + §5.1).
 *
 * Probes each operator for input multiplicities, then lowers the three-channel expression into a
 * shared vertex table. No inner/warp contexts in MP3·S1+S2.
 */

import type { Catalog } from '../catalog/index.ts';
import type { Expression, Node } from '../expression/index.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A vertex in the lowered DAG. Created once per unique (context, op, params, inputIds) key. */
export interface Vertex {
    /** Stable sequential id, assigned in topological order (children before parents). */
    readonly id: number;
    /** Operator name. */
    readonly op: string;
    /** Operator params. */
    readonly params: readonly number[];
    /** Ids of child vertices, in input order. */
    readonly inputIds: readonly number[];
    /** Coordinate context. Always 'root' in MP3·S1+S2 (no warp). */
    readonly context: string;
    /** Operator `requires` deps accumulated from this node. */
    readonly requires: readonly string[];
}

export interface LowerResult {
    /** All vertices in topological order (children before parents). */
    readonly vertices: readonly Vertex[];
    /** Usages[id] = number of times vertex `id` contributes to written GLSL text. */
    readonly usages: readonly number[];
    /** Vertex ids for the three output channels [r, g, b]. */
    readonly roots: readonly [number, number, number];
}

// ---------------------------------------------------------------------------
// Multiplicity probing (spec §5.0)
// ---------------------------------------------------------------------------

const ROOT_CTX = 'root';

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
 * (op, params) combination; result is stable.
 */
export function probeMultiplicities(
    catalog: Catalog,
    opName: string,
    params: readonly number[],
): number[] {
    const op = catalog.operator(opName);
    if (op.inputs.length === 0) {
        return [];
    }
    const sentinels = op.inputs.map((_, i) => `@${i}@`);
    const result = op.glsl(sentinels, params, { p: '@p@' });
    return sentinels.map((s) => countOccurrences(result, s));
}

// ---------------------------------------------------------------------------
// Lowering (spec §5.1) — no inner/warp contexts
// ---------------------------------------------------------------------------

/**
 * Lowers the three-channel expression into a shared DAG vertex table.
 *
 * Key format: `"root|op[p0,p1,...](id0,id1,...)"` — always prefixed with `root` (single context).
 */
export function lower(catalog: Catalog, expression: Expression): LowerResult {
    const vertices: Vertex[] = [];
    const usages: number[] = [];
    const vertexMap = new Map<string, number>(); // key → vertex id

    let nextId = 0;

    function lowerNode(node: Node): number {
        const { op, params, inputs } = node;

        // Recursively lower children first (topological order)
        const inputIds: number[] = inputs.map((child) => lowerNode(child));

        // Build the deduplication key
        const paramsStr = params.join(',');
        const inputsStr = inputIds.join(',');
        const key = `${ROOT_CTX}|${op}[${paramsStr}](${inputsStr})`;

        if (vertexMap.has(key)) {
            return vertexMap.get(key)!;
        }

        // Create new vertex
        const id = nextId++;
        const mg = probeMultiplicities(catalog, op, params);

        // Accumulate usages for children
        for (let i = 0; i < inputIds.length; i++) {
            usages[inputIds[i]] = (usages[inputIds[i]] ?? 0) + (mg[i] ?? 1);
        }

        const opDef = catalog.operator(op);

        const vertex: Vertex = {
            id,
            op,
            params,
            inputIds,
            context: ROOT_CTX,
            requires: opDef.requires ? [...opDef.requires] : [],
        };
        vertices.push(vertex);
        usages[id] = usages[id] ?? 0;
        vertexMap.set(key, id);

        return id;
    }

    const rId = lowerNode(expression.r);
    const gId = lowerNode(expression.g);
    const bId = lowerNode(expression.b);

    // Each channel root contributes 1 usage (spec §5.1 post-lowering step)
    usages[rId] = (usages[rId] ?? 0) + 1;
    usages[gId] = (usages[gId] ?? 0) + 1;
    usages[bId] = (usages[bId] ?? 0) + 1;

    return {
        vertices: Object.freeze(vertices),
        usages: Object.freeze(usages),
        roots: [rId, gId, bId],
    };
}
