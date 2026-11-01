import { nodeCount } from '../ir/ir';
import type { Expression } from '../ir/types';
import type { Catalog } from '../isa/catalog';
import { MAX_SOURCE_LENGTH } from '../spec/constants';
import { CodegenError } from '../spec/errors';
import { wrapInput } from './format';
import type { Compiled, SharingPolicy } from './types';

const ROOT = 'v_p';

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

export function compile(
    catalog: Catalog,
    expr: Expression,
    opts: { sharing?: SharingPolicy } = {},
): Compiled {
    const policy: SharingPolicy = opts.sharing ?? 'shared';
    const vertices: any[] = [];
    // Map<vertexId, usageCount> — grows dynamically, no size assumptions needed
    const usages = new Map<number, number>();
    const vmap = new Map<string, number>();
    let vid = 0;

    function addUsage(id: number, count = 1): void {
        usages.set(id, (usages.get(id) ?? 0) + count);
    }

    function lowerNode(node: any, cctx: string): number {
        const op = catalog.operator(node.op);
        const pstr = (node.params ?? []).join(',');
        const current = (node.inputs ?? []).slice(0, op.currentCount);
        const inner = (node.inputs ?? []).slice(op.currentCount);
        const cids = current.map((ch: any) => lowerNode(ch, cctx));
        const all = [...cids, ...inner.map((ch: any) => lowerNode(ch, cctx))];
        const key = `${cctx}|${node.op}[${pstr}](${all.join(',')})`;
        const existing = vmap.get(key);
        if (existing !== undefined) {
            return existing;
        }
        const id = vid++;
        all.forEach((aid) => addUsage(aid));
        vertices.push({ id, op: node.op, params: node.params ?? [], inputs: all, ctx: cctx });
        vmap.set(key, id);
        addUsage(id, 0); // initialize to 0 if not yet tracked
        return id;
    }

    const roots = [lowerNode(expr.r, ROOT), lowerNode(expr.g, ROOT), lowerNode(expr.b, ROOT)];
    for (const r of roots) {
        addUsage(r);
    }

    const ectx: EmitCtx = { vars: new Map(), inlines: new Map(), varCount: 0, lines: [] };
    // simple emission in vertex order
    for (const v of vertices) {
        const op = catalog.operator(v.op);
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
            // simple atom check
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
    const preamble = [
        'precision highp float;',
        'in vec2 vUv;',
        'out vec4 o_color;',
        'uniform float u_phase;',
        'const float PI = 3.141592653589793;',
        'vec3 ra_srgb(vec3 c){ c = clamp(c,0.0,1.0); vec3 lo=c/12.92; vec3 hi=pow((c+0.055)/1.055,vec3(2.4)); return mix(lo,hi,step(vec3(0.0031308),c)); }',
    ];
    const main = ['void main() {', '  vec2 v_p = vUv * 2.0 - 1.0;'];
    if (ectx.lines.length > 0) {
        main.push('');
        for (const l of ectx.lines) {
            main.push(l);
        }
    }
    main.push('');
    main.push(`  o_color = vec4(ra_srgb(vec3(${rtexts[0]}, ${rtexts[1]}, ${rtexts[2]})), 1.0);`);
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
            contexts: 1,
            sourceLength: source.length,
        },
    };
}
