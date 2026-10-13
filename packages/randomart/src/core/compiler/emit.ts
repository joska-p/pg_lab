/**
 * Emit.ts — GLSL emission pass (spec §5.2 + §5.3).
 *
 * Walks the vertex program in topological order, decides which vertices get a named variable
 * according to the sharing policy, and emits the corresponding GLSL lines.
 */

import type { Catalog } from '../catalog/index.ts';
import { isAtom, wrapInput } from './format.ts';
import type { LowerResult, Vertex } from './lower.ts';
import type { SharingPolicy } from './types.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmitResult {
    /** GLSL statement lines to place inside main() (before the final rgb assembly). */
    readonly lines: readonly string[];
    /** Number of GLSL variables emitted (stat). */
    readonly varCount: number;
    /** Text representation of the three channel roots [r, g, b] (may be inline or var name). */
    readonly channelTexts: readonly [string, string, string];
    /** Set of dependency names used across all vertices. */
    readonly usedDeps: ReadonlySet<string>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the GLSL text to use when a vertex is referenced as an input. */
function inputText(
    id: number,
    varNames: Map<number, string>,
    inlineTexts: Map<number, string>,
): string {
    const varName = varNames.get(id);
    if (varName !== undefined) {
        // Variable names are atoms (identifiers); no wrapping needed.
        return varName;
    }
    // Inline text: wrap if not atom/paren-enclosed (spec §5.3).
    return wrapInput(inlineTexts.get(id)!);
}

/** Decides whether a vertex receives a named variable, according to the sharing policy. */
function shouldHaveVariable(
    policy: SharingPolicy,
    usages: readonly number[],
    id: number,
    text: string,
): boolean {
    switch (policy) {
        case 'none': {
            return false;
        }
        case 'all': {
            return true;
        }
        case 'shared':
        default: {
            return (usages[id] ?? 0) >= 2 && !isAtom(text);
        }
    }
}

// ---------------------------------------------------------------------------
// Main emission
// ---------------------------------------------------------------------------

/**
 * Emits GLSL statements for each vertex in topological order. Returns the lines, variable count,
 * channel root texts, and used dependencies.
 */
export function emit(
    catalog: Catalog,
    { vertices, usages, roots }: LowerResult,
    policy: SharingPolicy,
): EmitResult {
    const lines: string[] = [];
    const varNames = new Map<number, string>();
    const inlineTexts = new Map<number, string>();
    const usedDeps = new Set<string>();
    let varCount = 0;

    // Context name for root (no warp in MP3·S1+S2)
    const ROOT_P = 'v_p';

    for (const vertex of vertices) {
        emitVertex(vertex);
    }

    function emitVertex(vertex: Vertex): void {
        const { id, op, params, inputIds, requires } = vertex;
        const opDef = catalog.operator(op);

        // Collect dependencies
        for (const req of requires) {
            usedDeps.add(req);
        }
        if (opDef.requires) {
            for (const req of opDef.requires) {
                usedDeps.add(req);
            }
        }

        // Build input texts for this vertex's glsl call
        const inputTexts = inputIds.map((childId) => inputText(childId, varNames, inlineTexts));

        // Compute raw GLSL text for this vertex
        const rawText = opDef.glsl(inputTexts, params, { p: ROOT_P });

        // Decide variable assignment
        if (shouldHaveVariable(policy, usages, id, rawText)) {
            const varName = `v${id}`;
            lines.push(`  float ${varName} = ${rawText};`);
            varNames.set(id, varName);
            varCount++;
        } else {
            inlineTexts.set(id, rawText);
        }
    }

    // Resolve channel root texts
    const channelTexts: [string, string, string] = roots.map((rootId) =>
        inputText(rootId, varNames, inlineTexts),
    ) as [string, string, string];

    return {
        lines: Object.freeze(lines),
        varCount,
        channelTexts,
        usedDeps,
    };
}
