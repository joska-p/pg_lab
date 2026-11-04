import { describe, expect, it } from 'vite-plus/test';

import { groupOf, ops, OP_NAMES } from './ops';

describe('ops', () => {
    it('arity === 0 is equivalent to family === "terminal" for every operator', () => {
        for (const name of OP_NAMES) {
            expect((ops[name].arity === 0) === (groupOf(name) === 'terminal')).toBe(true);
        }
    });

    it('every operator of arity > 0 throws on missing operands', () => {
        for (const name of OP_NAMES) {
            const def = ops[name];
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
