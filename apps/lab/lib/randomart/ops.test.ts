import { describe, expect, it } from 'vite-plus/test';

import { groupOf, getOp, OP_NAMES } from './ops';
import type { OpName, Point } from './ops';

const POINT: Point = { x: 0, y: 0, phase: 0 };
const SMOOTH_NAMES = ['smin', 'smax'] as const;
type SmoothName = (typeof SMOOTH_NAMES)[number];

function pointwise(name: OpName) {
    const def = getOp(name);
    if (def.kind === 'warp') {
        throw new Error(`${name} is not a pointwise operator`);
    }
    return def;
}

function evalSmooth(name: SmoothName, a: number, b: number, k: number): number {
    return pointwise(name).eval({ inputs: [a, b], params: { k }, point: POINT });
}

function glslSmooth(name: SmoothName, k: number): string {
    return pointwise(name).glsl({ inputs: ['a', 'b'], params: { k }, point: 'v_p' });
}

describe('ops', () => {
    it('arity === 0 is equivalent to family === "terminal" for every operator', () => {
        for (const name of OP_NAMES) {
            expect((getOp(name).arity === 0) === (groupOf(name) === 'terminal')).toBe(true);
        }
    });

    it('every operator of arity > 0 throws on missing operands', () => {
        for (const name of OP_NAMES) {
            const def = getOp(name);
            if (def.arity === 0) {
                continue;
            }
            const args = { inputs: [] as readonly string[], params: {}, point: 'v_p' };
            if (def.kind === 'warp') {
                expect(() => def.glslPoint(args)).toThrow(/Missing operand/);
            } else {
                expect(() => def.glsl(args)).toThrow(/Missing operand/);
            }
        }
    });
});

describe('smooth min/max', () => {
    const SAMPLES = [-1, -0.9, -0.4, 0, 0.3, 0.8, 1] as const;
    const RADII = [0.05, 0.1, 0.5] as const;

    it('smin stays at or below the minimum and smax at or above the maximum', () => {
        for (const k of RADII) {
            for (const a of SAMPLES) {
                for (const b of SAMPLES) {
                    const smin = evalSmooth('smin', a, b, k);
                    const smax = evalSmooth('smax', a, b, k);
                    expect(smin, `smin(${a},${b},${k})`).toBeLessThanOrEqual(
                        Math.min(a, b) + 1e-12,
                    );
                    expect(smax, `smax(${a},${b},${k})`).toBeGreaterThanOrEqual(
                        Math.max(a, b) - 1e-12,
                    );
                }
            }
        }
    });

    it('keeps both results finite and inside [-1, 1]', () => {
        for (const k of RADII) {
            for (const a of SAMPLES) {
                for (const b of SAMPLES) {
                    for (const name of SMOOTH_NAMES) {
                        const value = evalSmooth(name, a, b, k);
                        expect(Number.isFinite(value), `${name}(${a},${b},${k})`).toBe(true);
                        expect(value).toBeGreaterThanOrEqual(-1);
                        expect(value).toBeLessThanOrEqual(1);
                    }
                }
            }
        }
    });

    it('separates equal operands by k / 4 and converges to the operand when far apart', () => {
        expect(evalSmooth('smin', 0.2, 0.2, 0.2)).toBeCloseTo(0.2 - 0.05);
        expect(evalSmooth('smax', 0.2, 0.2, 0.2)).toBeCloseTo(0.2 + 0.05);
        expect(evalSmooth('smin', 0.8, -0.8, 0.1)).toBeCloseTo(-0.8);
        expect(evalSmooth('smax', 0.8, -0.8, 0.1)).toBeCloseTo(0.8);
    });

    it('emits the matching core helper with the k literal', () => {
        expect(glslSmooth('smin', 0.05)).toBe('ra_smin(a,b,0.05)');
        expect(glslSmooth('smax', 0.5)).toBe('ra_smax(a,b,0.5)');
    });
});
