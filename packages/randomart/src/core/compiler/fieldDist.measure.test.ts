import { describe, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { nodeCount } from '../expression/index.ts';
import type { Expression, Node } from '../expression/index.ts';
import { generate } from '../generator/index.ts';
import { createGrammar, defaultGrammar, randomizeWeights } from '../grammar/index.ts';
import type { Grammar } from '../grammar/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import { buildFuzzCases } from './testing.ts';

/**
 * Opt-in measurement of the _field_ distribution produced by `defaultGrammar`. `correlated` mode
 * maps the field to a palette through `t = clamp(field*0.5 + 0.5, 0, 1)`. The question is how much
 * of the image actually spans the [0, 1] ramp vs. piles up at the ends ("aplats").
 *
 *     VITE_MEASURE=1 vp test fieldDist
 *
 * The evaluator mirrors the operator `glsl` by hand (an opt-in probe, committed with the lot J
 * work; the CPU re-implementation of the operator semantics is the probe's known debt).
 */
const enabled = import.meta.env.VITE_MEASURE === '1';
const GRID = 128;
const CASES = Number(import.meta.env.VITE_FUZZ_COUNT ?? 200);

const fold2 = (v: number): number => Math.abs(((((v + 3) % 4) + 4) % 4) - 2) - 1;

interface P {
    x: number;
    y: number;
}

const evalNode = (node: Node, p: P, phase: number): number => {
    const a = (i: number): number => evalNode(node.inputs[i], p, phase);

    switch (node.operatorName) {
        case 'x':
            return p.x;
        case 'y':
            return p.y;
        case 'const':
            return node.params[0];
        case 'tsin':
            return Math.sin(2 * Math.PI * phase);
        case 'tcos':
            return Math.cos(2 * Math.PI * phase);
        case 'neg':
            return -a(0);
        case 'abs':
            return Math.abs(a(0));
        case 'sqr': {
            const v = a(0);
            return v * v;
        }
        case 'add':
            return (a(0) + a(1)) * 0.5;
        case 'mul':
            return a(0) * a(1);
        case 'div':
            return a(0) / (1 + Math.abs(a(1)));
        case 'min':
            return Math.min(a(0), a(1));
        case 'max':
            return Math.max(a(0), a(1));
        case 'mix': {
            const t = (a(2) + 1) * 0.5;
            return a(0) * (1 - t) + a(1) * t;
        }
        case 'gt':
            return a(0) > a(1) ? 1 : -1;
        case 'select':
            return a(0) > 0 ? a(1) : a(2);
        case 'sin':
            return Math.sin(Math.PI * a(0));
        case 'cos':
            return Math.cos(Math.PI * a(0));
        case 'warp': {
            const dx = a(0);
            const dy = a(1);
            const warped: P = { x: fold2(p.x + 0.5 * dx), y: fold2(p.y + 0.5 * dy) };
            return evalNode(node.inputs[2], warped, phase);
        }
        default:
            throw new Error(`measure: no evaluator for "${node.operatorName}"`);
    }
};

interface Stats {
    min: number;
    max: number;
    meanAbs: number;
    saturated: number; // fraction with |field| >= 0.95
    flat: number; // fraction of pixels whose 4-neighbourhood varies by < 0.01
}

function measure(expression: Expression, phase: number): Stats {
    const field = new Float64Array(GRID * GRID);
    let i = 0;

    for (let iy = 0; iy < GRID; iy++) {
        for (let ix = 0; ix < GRID; ix++) {
            const p: P = { x: (ix / (GRID - 1)) * 2 - 1, y: (iy / (GRID - 1)) * 2 - 1 };
            field[i++] = evalNode(expression.r, p, phase);
        }
    }

    let min = Infinity;
    let max = -Infinity;
    let sumAbs = 0;
    let saturated = 0;
    let flat = 0;

    for (let iy = 0; iy < GRID; iy++) {
        for (let ix = 0; ix < GRID; ix++) {
            const v = field[iy * GRID + ix];
            min = Math.min(min, v);
            max = Math.max(max, v);
            sumAbs += Math.abs(v);
            if (Math.abs(v) >= 0.95) {
                saturated++;
            }

            let localMax = 0;
            for (const [dx, dy] of [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ] as const) {
                const nx = ix + dx;
                const ny = iy + dy;
                if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) {
                    continue;
                }
                localMax = Math.max(localMax, Math.abs(field[ny * GRID + nx] - v));
            }
            if (localMax < 0.01) {
                flat++;
            }
        }
    }

    return {
        min,
        max,
        meanAbs: sumAbs / (GRID * GRID),
        saturated: saturated / (GRID * GRID),
        flat: flat / (GRID * GRID),
    };
}

const mean = (xs: number[]): number => xs.reduce((s, v) => s + v, 0) / xs.length;
const pct = (xs: number[], p: number): number =>
    [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(p * xs.length))];

describe('field distribution', () => {
    it.skipIf(!enabled)('reports how the default-grammar field occupies the palette ramp', () => {
        const catalog = createDefaultCatalog();
        const cases = buildFuzzCases(catalog, CASES).filter((_, i) => i % 2 === 1);
        const mins: number[] = [];
        const maxs: number[] = [];
        const meanAbs: number[] = [];
        const saturated: number[] = [];
        const flat: number[] = [];
        let globalMin = Infinity;
        let globalMax = -Infinity;

        for (const { grammar, seed } of cases) {
            const expression = generate(catalog, grammar, seed);
            const s = measure(expression, 0);
            mins.push(s.min);
            maxs.push(s.max);
            meanAbs.push(s.meanAbs);
            saturated.push(s.saturated);
            flat.push(s.flat);
            globalMin = Math.min(globalMin, s.min);
            globalMax = Math.max(globalMax, s.max);
        }

        console.log(
            `[fieldDist] correlated cases=${cases.length} grid=${GRID}x${GRID} (phase 0)\n` +
                `  field range : global [${globalMin.toFixed(3)}, ${globalMax.toFixed(3)}]\n` +
                `  field min   : mean ${mean(mins).toFixed(3)} p05 ${pct(mins, 0.05).toFixed(3)}\n` +
                `  field max   : mean ${mean(maxs).toFixed(3)} p95 ${pct(maxs, 0.95).toFixed(3)}\n` +
                `  |field| mean: ${mean(meanAbs).toFixed(3)}\n` +
                `  saturated   : mean ${(100 * mean(saturated)).toFixed(1)}% (|field| >= 0.95)\n` +
                `  locally flat: mean ${(100 * mean(flat)).toFixed(1)}% (4-neighbourhood variation < 0.01)`,
        );
    });

    it.skipIf(!enabled)(
        'measures flatness across phases (is phase 0 degenerate?)',
        () => {
            const catalog = createDefaultCatalog();
            const cases = buildFuzzCases(catalog, CASES).filter((_, i) => i % 2 === 1);
            const phases = [0, 0.125, 0.25, 0.5];

            for (const phase of phases) {
                const flats: number[] = [];
                const dead: number[] = [];

                for (const { grammar, seed } of cases) {
                    const expression = generate(catalog, grammar, seed);
                    const s = measure(expression, phase);
                    flats.push(s.flat);
                    dead.push(s.max - s.min < 0.02 ? 1 : 0);
                }

                console.log(
                    `  phase ${phase.toFixed(3)}: locally flat ${(100 * mean(flats)).toFixed(1)}%  ` +
                        `constant (<0.02 range) ${(100 * mean(dead)).toFixed(1)}%`,
                );
            }
        },
        120_000,
    );

    it.skipIf(!enabled)(
        'correlates flatness with operator presence',
        () => {
            const catalog = createDefaultCatalog();
            const cases = buildFuzzCases(catalog, CASES).filter((_, i) => i % 2 === 1);
            const withOp = new Map<string, number[]>();
            const withoutOp = new Map<string, number[]>();
            const opNames = catalog.operators().map((o) => o.name);

            const collect = (node: Node, into: Set<string>): void => {
                into.add(node.operatorName);
                for (const child of node.inputs) {
                    collect(child, into);
                }
            };

            for (const { grammar, seed } of cases) {
                const expression = generate(catalog, grammar, seed);
                const flat = measure(expression, 0).flat;
                const present = new Set<string>();
                collect(expression.r, present);

                for (const op of opNames) {
                    if (!withOp.has(op)) {
                        withOp.set(op, []);
                    }
                    if (!withoutOp.has(op)) {
                        withoutOp.set(op, []);
                    }
                    (present.has(op) ? withOp : withoutOp).get(op)!.push(flat);
                }
            }

            const rows = opNames
                .filter((op) => (withOp.get(op)?.length ?? 0) >= 5)
                .map((op) => ({
                    op,
                    present: withOp.get(op)!.length,
                    flatWith: Number((100 * mean(withOp.get(op)!)).toFixed(1)),
                    flatWithout: Number((100 * mean(withoutOp.get(op)!)).toFixed(1)),
                }))
                .sort((a, b) => b.flatWith - b.flatWithout - (a.flatWith - a.flatWithout));

            console.table(rows);
        },
        120_000,
    );

    it.skipIf(!enabled)(
        'compares candidate default weights',
        () => {
            const catalog = createDefaultCatalog();
            const opNames = catalog.operators().map((o) => o.name);

            const build = (overrides: Record<string, number>): Grammar => {
                const weights: Record<string, number> = {};
                for (const name of opNames) {
                    weights[name] =
                        name === 'x' || name === 'y'
                            ? 3
                            : name === 'const'
                              ? 1
                              : name === 'select' || name === 'mix' || name === 'warp'
                                ? 0.5
                                : 1;
                }
                Object.assign(weights, overrides);
                return createGrammar(catalog, {
                    weights,
                    constraints: defaultGrammar(catalog).constraints,
                    channels: defaultGrammar(catalog).channels,
                });
            };

            const CANDIDATES: { name: string; overrides: Record<string, number> }[] = [
                { name: 'baseline', overrides: {} },
                {
                    name: 'gentle',
                    overrides: {
                        x: 4,
                        y: 4,
                        max: 2,
                        min: 1.5,
                        const: 0.5,
                        add: 0.5,
                        gt: 0.5,
                        tsin: 0.5,
                        tcos: 0.5,
                        mul: 0.75,
                    },
                },
                {
                    name: 'strong',
                    overrides: {
                        x: 5,
                        y: 5,
                        max: 2,
                        min: 2,
                        const: 0.3,
                        add: 0.3,
                        gt: 0.3,
                        tsin: 0.25,
                        tcos: 0.25,
                        mul: 0.5,
                        select: 0.3,
                        mix: 0.3,
                    },
                },
                {
                    name: 'no-time',
                    overrides: {
                        x: 5,
                        y: 5,
                        max: 2,
                        min: 2,
                        const: 0.3,
                        add: 0.3,
                        gt: 0.3,
                        tsin: 0,
                        tcos: 0,
                        mul: 0.5,
                        select: 0.3,
                        mix: 0.3,
                    },
                },
            ];

            const rows = CANDIDATES.map(({ name, overrides }) => {
                const grammar = build(overrides);
                const flats: number[] = [];
                const dead: number[] = [];
                const structured: number[] = [];
                const nodes: number[] = [];
                let errors = 0;

                for (let i = 0; i < CASES; i++) {
                    try {
                        const expression = generate(catalog, grammar, createSeed(i * 7919 + 1));
                        const s = measure(expression, 0);
                        flats.push(s.flat);
                        dead.push(s.flat > 0.8 ? 1 : 0);
                        structured.push(s.flat < 0.4 ? 1 : 0);
                        nodes.push(nodeCount(expression.r));
                    } catch {
                        errors++;
                    }
                }

                return {
                    candidate: name,
                    fitErrors: errors,
                    meanFlat: Number((100 * mean(flats)).toFixed(1)),
                    deadAplats: Number((100 * mean(dead)).toFixed(1)),
                    structured: Number((100 * mean(structured)).toFixed(1)),
                    nodes: Number(mean(nodes).toFixed(1)),
                };
            });

            console.table(rows);
        },
        120_000,
    );

    it.skipIf(!enabled)('shows a monotone remap cannot change local flatness', () => {
        const catalog = createDefaultCatalog();
        const base = defaultGrammar(catalog);
        let agree = 0;
        let total = 0;

        for (let i = 0; i < CASES; i++) {
            const seed = createSeed(i * 7919 + 1);
            const grammar =
                i % 2 === 1 ? randomizeWeights(catalog, base, createRng(createSeed(i + 1))) : base;
            const expression = generate(catalog, grammar, seed);

            // `hard` and `tanh` are both strictly increasing in the field, so they always rank two
            // pixels the same way: `f1 < f2` iff `hard(f1) < hard(f2)` iff `tanh(f1) < tanh(f2)`.
            for (let k = 0; k < 400; k++) {
                const f = evalNode(
                    expression.r,
                    { x: ((k * 37) % 200) / 100 - 1, y: ((k * 53) % 200) / 100 - 1 },
                    0,
                );
                const hard = f * 0.5 + 0.5;
                const tanh = 0.5 + 0.5 * Math.tanh(f);
                if (Math.sign(hard - 0.5) === Math.sign(tanh - 0.5)) {
                    agree++;
                }
                total++;
            }
        }

        console.log(
            `[monotone] ${agree}/${total} samples keep the hard/tanh ordering (flatness invariant)`,
        );
    });
});
