import { colorSpaceFunction, colorSpaceGlsl, isColorSpaceId } from '../color/color';
import type { ColorSpaceId } from '../color/registry';
import { nodeCount } from '../ir/ir';
import type { Expression, Node } from '../ir/types';
import type { Catalog } from '../isa/catalog';
import { MAX_SOURCE_LENGTH } from '../spec/constants';
import { CodegenError } from '../spec/errors';
import { wrapInput, isGlslAtom } from './format';
import shaderHeader from './shader/header.glsl?raw';
import raFold2Glsl from './shader/ra_fold2.glsl?raw';
import type { Compiled, SharingPolicy } from './types';

const ROOT = 'v_p';

const DEPENDENCY_CODE: Record<string, string> = {
    ra_fold2: raFold2Glsl,
};

interface EmitCtx {
    vars: Map<number, string>;
    inlines: Map<number, string>;
    varCount: number;
    lines: string[];
}

interface Vertex {
    readonly id: number;
    readonly op: string;
    readonly params: readonly number[];
    readonly inputs: readonly number[];
    readonly ctx: string;
}

interface ContextDef {
    readonly id: number;
    readonly name: string;
    readonly parent: string;
    readonly op: string;
    readonly params: readonly number[];
    readonly currentInputIds: readonly number[];
}

type Emission =
    | { readonly kind: 'context'; readonly context: ContextDef }
    | { readonly kind: 'vertex'; readonly vertex: Vertex };

function getInputText(id: number, ctx: EmitCtx): string {
    const v = ctx.vars.get(id);
    if (v !== undefined) {
        return v;
    }
    const inl = ctx.inlines.get(id);
    if (inl === undefined) {
        throw new CodegenError(`Missing input text for ${id}`);
    }
    return wrapInput(inl);
}

export interface CompileOptions {
    sharing?: SharingPolicy;
    space?: ColorSpaceId;
}

export function compile(catalog: Catalog, expr: Expression, opts: CompileOptions = {}): Compiled {
    const policy: SharingPolicy = opts.sharing ?? 'shared';
    if (!isColorSpaceId(opts.space)) {
        throw new CodegenError(
            `Randomart: invalid color space at "compile.space" — got ${JSON.stringify(opts.space)}`,
        );
    }
    const space: ColorSpaceId = opts.space;

    const vertices: Vertex[] = [];
    const emissions: Emission[] = [];
    const usages = new Map<number, number>();
    const vmap = new Map<string, number>();
    let vid = 0;
    let nextContextId = 1;
    const contextMap = new Map<string, string>();
    const contextDefs: ContextDef[] = [];

    function addUsage(id: number, count = 1): void {
        usages.set(id, (usages.get(id) ?? 0) + count);
    }

    function lowerNode(node: Node, cctx: string): number {
        const op = catalog.operator(node.op);
        const pstr = (node.params ?? []).join(',');
        const current = (node.inputs ?? []).slice(0, op.currentCount);
        const inner = (node.inputs ?? []).slice(op.currentCount);
        const currentIds = current.map((ch: Node) => lowerNode(ch, cctx));

        let innerContext = cctx;
        if (op.hasInner) {
            const contextKey = `${cctx}|${node.op}[${pstr}](${currentIds.join(',')})`;
            const known = contextMap.get(contextKey);
            if (known === undefined) {
                const id = nextContextId++;
                innerContext = `c${id}`;
                contextMap.set(contextKey, innerContext);
                const context: ContextDef = {
                    id,
                    name: innerContext,
                    parent: cctx,
                    op: node.op,
                    params: node.params ?? [],
                    currentInputIds: currentIds,
                };
                contextDefs.push(context);
                emissions.push({ kind: 'context', context });
                for (const cid of currentIds) {
                    addUsage(cid);
                }
            } else {
                innerContext = known;
            }
        }

        const innerIds = inner.map((ch: Node) => lowerNode(ch, innerContext));
        const all = [...currentIds, ...innerIds];
        const key = `${cctx}|${node.op}[${pstr}](${all.join(',')})`;
        const existing = vmap.get(key);
        if (existing !== undefined) {
            return existing;
        }
        const id = vid++;
        for (const aid of all) {
            addUsage(aid);
        }
        const vertex: Vertex = {
            id,
            op: node.op,
            params: node.params ?? [],
            inputs: all,
            ctx: cctx,
        };
        vertices.push(vertex);
        emissions.push({ kind: 'vertex', vertex });
        vmap.set(key, id);
        addUsage(id, 0);
        return id;
    }

    const roots = [lowerNode(expr.r, ROOT), lowerNode(expr.g, ROOT), lowerNode(expr.b, ROOT)];
    for (const r of roots) {
        addUsage(r);
    }

    const ectx: EmitCtx = { vars: new Map(), inlines: new Map(), varCount: 0, lines: [] };
    const usedDeps = new Set<string>();

    for (const emission of emissions) {
        if (emission.kind === 'context') {
            const ctx = emission.context;
            const op = catalog.operator(ctx.op);
            for (const req of op.requires) {
                usedDeps.add(req);
            }
            const parentP = ctx.parent === ROOT ? 'v_p' : ctx.parent;
            const currentTexts = ctx.currentInputIds.map((aid) => getInputText(aid, ectx));
            const coordsText = op.coords(currentTexts, ctx.params, parentP);
            ectx.lines.push(`  vec2 ${ctx.name} = ${coordsText};`);
            continue;
        }

        const v = emission.vertex;
        const op = catalog.operator(v.op);
        for (const req of op.requires) {
            usedDeps.add(req);
        }
        const itexts = v.inputs.map((aid: number) => getInputText(aid, ectx));
        const pctx = v.ctx === ROOT ? 'v_p' : v.ctx;
        const raw = op.glsl(itexts, v.params, pctx);
        const useVar = (() => {
            if (policy === 'none') {
                return false;
            }
            if (policy === 'all') {
                return true;
            }
            const u = usages.get(v.id) ?? 0;
            return u >= 2 && !isGlslAtom(raw);
        })();
        if (useVar) {
            const name = `v${ectx.varCount++}`;
            ectx.lines.push(`  float ${name} = ${raw};`);
            ectx.vars.set(v.id, name);
        } else {
            ectx.inlines.set(v.id, raw);
        }
    }

    const rtexts = roots.map((rid) => getInputText(rid, ectx)) as [string, string, string];
    const preamble: string[] = shaderHeader.split('\n');

    for (const dep of usedDeps) {
        const code = DEPENDENCY_CODE[dep];
        if (code) {
            preamble.push('', code);
        }
    }

    preamble.push('', colorSpaceGlsl(space));

    const main = ['void main() {', '  vec2 v_p = vUv * 2.0 - 1.0;'];
    if (ectx.lines.length > 0) {
        main.push('');
        for (const l of ectx.lines) {
            main.push(l);
        }
    }
    main.push('');
    main.push(
        `  o_color = vec4(${colorSpaceFunction(space)}(vec3(${rtexts[0]}, ${rtexts[1]}, ${rtexts[2]})), 1.0);`,
    );
    main.push('}');
    const source = [...preamble, '', ...main].join('\n');
    if (source.length > MAX_SOURCE_LENGTH) {
        throw new CodegenError(`Source too long: ${source.length}`);
    }
    const animated = source.includes('u_phase');
    return {
        source,
        uniforms: animated ? [{ name: 'u_phase', glslType: 'float' }] : [],
        animated,
        stats: {
            nodes: nodeCount(expr),
            vertices: vertices.length,
            variables: ectx.varCount,
            contexts: 1 + contextDefs.length,
            sourceLength: source.length,
        },
    };
}
