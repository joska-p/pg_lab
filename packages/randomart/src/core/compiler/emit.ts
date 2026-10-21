import type { Catalog } from '../catalog/Catalog';
import { isAtom, wrapInput } from './format';
import { ROOT_CTX } from './lower';
import type { ContextDef, LowerResult, Vertex } from './lower';
import type { SharingPolicy } from './types';

export interface EmitResult {
    readonly lines: readonly string[];
    readonly varCount: number;
    readonly channelTexts: readonly [string, string, string];
    readonly usedDeps: ReadonlySet<string>;
}

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

/**
 * Emits GLSL statements in topological program order. Returns lines, variable count, channel roots,
 * and used dependencies.
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

        for (const req of requires) {
            usedDeps.add(req);
        }
        for (const req of operator.requires) {
            usedDeps.add(req);
        }

        const inputTexts = inputIds.map((childId) => inputText(childId, varNames, inlineTexts));
        const glslP = context === ROOT_CTX ? 'v_p' : context;
        const rawText = operator.glsl(inputTexts, params, glslP);

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
