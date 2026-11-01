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

const defs: OperatorDef[] = [
    {
        name: 'x',
        label: 'x',
        group: 'terminal',
        params: {
            amp: { min: 0, max: 1, step: 0.1 },
            phase: { min: 0, max: 1, step: 0.1 },
            cycles: { min: 1, max: 4, step: 1 },
        },
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
        group: 'non-terminal',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `(${args.a}+${args.b})*0.5`,
    },
    {
        name: 'sub',
        label: '-',
        group: 'non-terminal',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `(${args.a}-${args.b})*0.5`,
    },
    {
        name: 'mul',
        label: '*',
        group: 'non-terminal',
        inputs: ['a', 'b'],
        glsl: ({ args }) => `${args.a}*${args.b}`,
    },
    {
        name: 'sin',
        label: 'sin',
        group: 'non-terminal',
        inputs: ['a'],
        glsl: ({ args }) => `sin(${PI}*${args.a})`,
    },
    {
        name: 'cos',
        label: 'cos',
        group: 'non-terminal',
        inputs: ['a'],
        glsl: ({ args }) => `cos(${PI}*${args.a})`,
    },
    {
        name: 'neg',
        label: 'neg',
        group: 'non-terminal',
        inputs: ['a'],
        glsl: ({ args }) => `-(${args.a})`,
    },
    {
        name: 'sqr',
        label: 'sqr',
        group: 'non-terminal',
        inputs: ['a'],
        glsl: ({ args }) => `${args.a}*${args.a}`,
    },
];

export function createDefaultCatalog(): Catalog {
    const cat = new Catalog();
    for (const d of defs) {
        cat.register(d);
    }
    return cat;
}

export const defaultCatalog = createDefaultCatalog();
