/**
 * Emit.ts — GLSL emission pass.
 *
 * Walks the vertex program in topological order, decides which vertices get a named variable
 * according to the sharing policy, and emits the corresponding GLSL lines.
 */

import type { Catalog } from '../catalog/Catalog';
import { isAtom, wrapInput } from './format';
import { ROOT_CTX } from './lower';
import type { ContextDef, LowerResult, Vertex } from './lower';
import type { SharingPolicy } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmitResult {
    /** GLSL statement lines to place inside main() (before the final rgb assembly). */
    readonly lines: readonly string[];
    /** Number of GLSL variables emitted (stat, excluding coordinate contexts). */
    readonly varCount: number;
    /** Text representation of the three channel roots [r, g, b] (may be inline or var name). */
    readonly channelTexts: readonly [string, string, string];
    /** Set of dependency names used across all vertices and contexts. */
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
    // Inline text: wrap if not atom/paren-enclosed. A vertex is either named or inlined when it is
    // emitted, so a missing text means the program order broke — fail loudly, never emit `undefined`.
    const inline = inlineTexts.get(id);

    if (inline === undefined) {
        throw new Error(`Emit: vertex ${id} has neither a variable nor inline text`);
    }

    return wrapInput(inline);
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
 * Emits GLSL statements for each context and vertex in topological program order. Returns the
 * lines, variable count, channel root texts, and used dependencies.
 */
export function emit(
    catalog: Catalog,
    { program, vertices, usages, roots }: LowerResult,
    policy: SharingPolicy,
): EmitResult {
    const lines: string[] = [];
    const varNames = new Map<number, string>();
    const inlineTexts = new Map<number, string>();
    const usedDeps = new Set<string>();
    let varCount = 0;

    function emitContext(ctx: ContextDef): void {
        const { name, parentName, operatorName, params, currentInputIds, requires } = ctx;
        const operator = catalog.operator(operatorName);

        for (const req of requires) {
            usedDeps.add(req);
        }
        for (const req of operator.requires) {
            usedDeps.add(req);
        }

        const parentGlslP = parentName === ROOT_CTX ? 'v_p' : parentName;
        const currentInputTexts = currentInputIds.map((childId) =>
            inputText(childId, varNames, inlineTexts),
        );

        const coordsText = operator.coords(currentInputTexts, params, parentGlslP);
        lines.push(`  vec2 ${name} = ${coordsText};`);
    }

    function emitVertex(vertex: Vertex): void {
        const { id, operatorName, params, inputIds, context, requires } = vertex;
        const operator = catalog.operator(operatorName);

        // Collect dependencies
        for (const req of requires) {
            usedDeps.add(req);
        }
        for (const req of operator.requires) {
            usedDeps.add(req);
        }

        // Build input texts for this vertex's glsl call
        const inputTexts = inputIds.map((childId) => inputText(childId, varNames, inlineTexts));

        const glslP = context === ROOT_CTX ? 'v_p' : context;
        const rawText = operator.glsl(inputTexts, params, glslP);

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

    if (program) {
        for (const item of program) {
            if (item.kind === 'context') {
                emitContext(item.context);
            } else {
                emitVertex(item.vertex);
            }
        }
    } else {
        for (const vertex of vertices) {
            emitVertex(vertex);
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
