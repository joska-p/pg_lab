import { colorSpaceFunction, colorSpaceGlsl, isColorSpaceId } from '../color';
import type { ColorSpaceId } from '../color';
import { nodeCount } from '../ir/ir';
import type { Expression } from '../ir/types';
import type { Catalog } from '../isa/catalog';
import { MAX_SOURCE_LENGTH } from '../spec/constants';
import { CodegenError } from '../spec/errors';
import { wrapInput } from './format';
import type { Compiled, SharingPolicy } from './types';

const ROOT = 'v_p';

const DEPENDENCY_CODE: Record<string, string> = {
    ra_fold2: 'vec2 ra_fold2(vec2 v) { return abs(mod(v + 3.0, 4.0) - 2.0) - 1.0; }',
};

interface EmitCtx {
    vars: Map<number, string>;
    inlines: Map<number, string>;
    varCount: number;
    lines: string[];
}

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
    space?: ColorSpaceId | string;
}

export function compile(catalog: Catalog, expr: Expression, opts: CompileOptions = {}): Compiled {
    const policy: SharingPolicy = opts.sharing ?? 'shared';
    const space: ColorSpaceId = isColorSpaceId(opts.space) ? opts.space : 'srgb';

    const vertices: Array<{
        id: number;
        op: string;
        params: readonly number[];
        inputs: readonly number[];
        ctx: string;
    }> = [];
    const usages = new Map<number, number>();
    const vmap = new Map<string, number>();
    let vid = 0;
    let nextContextId = 1;
    const contextMap = new Map<string, string>();
    const contextDefs: Array<{
        id: number;
        name: string;
        parent: string;
        op: string;
        params: readonly number[];
        currentInputIds: readonly number[];
    }> = [];

    function addUsage(id: number, count = 1): void {
        usages.set(id, (usages.get(id) ?? 0) + count);
    }

    function lowerNode(node: any, cctx: string): number {
        const op = catalog.operator(node.op);
        const pstr = (node.params ?? []).join(',');
        const current = (node.inputs ?? []).slice(0, op.currentCount);
        const inner = (node.inputs ?? []).slice(op.currentCount);
        const currentIds = current.map((ch: any) => lowerNode(ch, cctx));

        let innerContext = cctx;
        if (op.hasInner) {
            const contextKey = `${cctx}|${node.op}[${pstr}](${currentIds.join(',')})`;
            const known = contextMap.get(contextKey);
            if (known === undefined) {
                const id = nextContextId++;
                innerContext = `c${id}`;
                contextMap.set(contextKey, innerContext);
                contextDefs.push({
                    id,
                    name: innerContext,
                    parent: cctx,
                    op: node.op,
                    params: node.params ?? [],
                    currentInputIds: currentIds,
                });
                for (const cid of currentIds) {
                    addUsage(cid);
                }
            } else {
                innerContext = known;
            }
        }

        const innerIds = inner.map((ch: any) => lowerNode(ch, innerContext));
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
        vertices.push({ id, op: node.op, params: node.params ?? [], inputs: all, ctx: cctx });
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

    for (const ctx of contextDefs) {
        const op = catalog.operator(ctx.op);
        for (const req of op.requires) {
            usedDeps.add(req);
        }
        const parentP = ctx.parent === ROOT ? 'v_p' : ctx.parent;
        const currentTexts = ctx.currentInputIds.map((aid) => getInputText(aid, ectx));
        const coordsText = op.coords(currentTexts, ctx.params, parentP);
        ectx.lines.push(`  vec2 ${ctx.name} = ${coordsText};`);
    }

    for (const v of vertices) {
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
            const isAtom =
                /^v_p\.[xy]$/.test(raw) ||
                /^u_phase$/.test(raw) ||
                /^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/.test(raw) ||
                /^\(-[0-9]+/.test(raw);
            return u >= 2 && !isAtom;
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
    const preamble: string[] = [
        'precision highp float;',
        '',
        'in vec2 vUv;',
        'out vec4 o_color;',
        '',
        'uniform float u_phase;',
        'const float PI = 3.141592653589793;',
    ];

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
