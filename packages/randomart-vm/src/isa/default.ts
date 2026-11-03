import { Catalog } from './catalog';
import type { OperatorDef } from './types';

const PI = '3.141592653589793';

function fmtNum(n: number): string {
    if (Object.is(n, -0)) {
        return '0.0';
    }
    if (n === 0) {
        return '0.0';
    }
    if (Number.isInteger(n)) {
        return `${n}.0`;
    }
    const s = n.toString();
    if (s.includes('e') || s.includes('E')) {
        return s;
    }
    return s.includes('.') ? s : `${s}.0`;
}

const defs = [
    {
        name: 'x',
        label: 'x',
        group: 'terminal',
        params: {
            amp: { min: 0, max: 1, step: 0.1 },
            phase: { min: 0, max: 1, step: 0.1 },
            cycles: { min: 1, max: 4, step: 1 },
        },
        requires: ['u_phase'],
        glsl: ({ p, params }) => {
            const amp = params.amp ?? 0;
            const phase = params.phase ?? 0;
            const cycles = params.cycles ?? 1;
            if (amp === 0) {
                return `${p}.x`;
            }
            return `(${fmtNum(amp)}*${p}.x+${fmtNum(1 - amp)}*sin(2.0*${PI}*${fmtNum(cycles)}*u_phase+${PI}*${fmtNum(phase)}))`;
        },
    },
    {
        name: 'y',
        label: 'y',
        group: 'terminal',
        params: {
            amp: { min: 0, max: 1, step: 0.1 },
            phase: { min: 0, max: 1, step: 0.1 },
            cycles: { min: 1, max: 4, step: 1 },
        },
        requires: ['u_phase'],
        glsl: ({ p, params }) => {
            const amp = params.amp ?? 0;
            const phase = params.phase ?? 0;
            const cycles = params.cycles ?? 1;
            if (amp === 0) {
                return `${p}.y`;
            }
            return `(${fmtNum(amp)}*${p}.y+${fmtNum(1 - amp)}*sin(2.0*${PI}*${fmtNum(cycles)}*u_phase+${PI}*${fmtNum(phase)}))`;
        },
    },
    {
        name: 'const',
        label: 'const',
        group: 'terminal',
        params: { value: { min: -2, max: 2 } },
        glsl: ({ params }) => {
            const v = params.value ?? 0;
            const s = fmtNum(v);
            if (v < 0) {
                return `(${s})`;
            }
            return s;
        },
    },
    {
        name: 'add',
        label: '+',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `(${args.a}+${args.b})*0.5`,
    },
    {
        name: 'sub',
        label: '-',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `(${args.a}-${args.b})*0.5`,
    },
    {
        name: 'mul',
        label: '*',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `${args.a}*${args.b}`,
    },
    {
        name: 'div',
        label: 'div',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `(${args.a}/(1.0+abs(${args.b})))`,
    },
    {
        name: 'neg',
        label: 'neg',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args }) => `-(${args.a})`,
    },
    {
        name: 'abs',
        label: 'abs',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args }) => `abs(${args.a})`,
    },
    {
        name: 'sqr',
        label: 'sqr',
        group: 'arithmetic',
        inputs: ['a'],
        glsl: ({ args }) => `${args.a}*${args.a}`,
    },
    {
        name: 'min',
        label: 'min',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `min(${args.a},${args.b})`,
    },
    {
        name: 'max',
        label: 'max',
        group: 'arithmetic',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `max(${args.a},${args.b})`,
    },
    {
        name: 'mix',
        label: 'mix',
        group: 'arithmetic',
        inputs: ['a', 'b', 't'],
        glsl: ({ args }) => `mix(${args.a},${args.b},(${args.t}+1.0)*0.5)`,
    },
    {
        name: 'sin',
        label: 'sin',
        group: 'trigonometry',
        inputs: ['a'],
        glsl: ({ args }) => `sin(${PI}*${args.a})`,
    },
    {
        name: 'cos',
        label: 'cos',
        group: 'trigonometry',
        inputs: ['a'],
        glsl: ({ args }) => `cos(${PI}*${args.a})`,
    },
    {
        name: 'gt',
        label: 'gt',
        group: 'logic',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `(${args.a}>${args.b} ? 1.0 : -1.0)`,
    },
    {
        name: 'select',
        label: 'select',
        group: 'logic',
        inputs: ['c', 'a', 'b'],
        glsl: ({ args }) => `(${args.c}>0.0 ? ${args.a} : ${args.b})`,
    },
    {
        name: 'warp',
        label: 'warp',
        group: 'transform',
        inputs: ['dx', 'dy'],
        inner: ['f'],
        requires: ['ra_fold2'],
        coords: ({ p, args }) => `ra_fold2(${p}+0.5*vec2(${args.dx},${args.dy}))`,
        glsl: ({ args }) => args.f,
    },
] as const satisfies OperatorDef[];

export function createDefaultCatalog(): Catalog {
    const cat = new Catalog();
    for (const d of defs) {
        cat.register(d);
    }
    return cat;
}

export const defaultCatalog = createDefaultCatalog();

/**
 * Identifiant d'opérateur du catalogue par défaut. Déclaré ici (source de vérité ancrée sur le
 * catalogue concret) plutôt que dans `isa/types.ts`, afin que le type des poids de grammaire puisse
 * y faire référence sans import circulaire.
 */
export type OperatorId = (typeof defs)[number]['name'];
