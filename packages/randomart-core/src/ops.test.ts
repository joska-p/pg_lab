import { describe, expect, it } from 'vite-plus/test';

import { groupOf, ops, OP_NAMES } from './ops';

describe('ops', () => {
    it('arity === 0 is equivalent to family === "terminal" for every operator', () => {
        for (const name of OP_NAMES) {
            expect((ops[name].arity === 0) === (groupOf(name) === 'terminal')).toBe(true);
        }
    });
});
