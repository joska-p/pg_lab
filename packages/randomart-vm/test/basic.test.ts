import { describe, expect, it } from 'vite-plus/test';

import { vm, createRng, serialize, deserialize } from '../src/index';

describe('vm basic', () => {
    it('creates grammar with weights', () => {
        const g = vm.createGrammar({ weights: { x: 1, add: 1 }, size: 'medium', shareDepth: 1 });
        expect(g.weights.x).toBe(1);
        expect(g.size).toBe('medium');
    });

    it('generates deterministic expression', () => {
        const g = vm.createGrammar({
            weights: { x: 2, y: 1, add: 1, mul: 1, sin: 1 },
            size: 'small',
            shareDepth: 1,
        });
        const e1 = vm.generate(g, 12345);
        const e2 = vm.generate(g, 12345);
        expect(serialize(e1)).toEqual(serialize(e2));
    });

    it('compiles to glsl with contract', () => {
        const g = vm.createGrammar({
            weights: { x: 1, const: 1, add: 1 },
            size: 'tiny',
            shareDepth: 0,
        });
        const res = vm.render(g, 42);
        expect(res.compiled.source).toContain('in vec2 vUv');
        expect(res.compiled.source).toContain('out vec4 o_color');
        expect(res.compiled.source).toContain('uniform float u_phase');
        expect(res.compiled.source).toContain('void main()');
    });

    it('serializes and deserializes', () => {
        const g = vm.createGrammar({
            weights: { x: 1, sin: 1, add: 1 },
            size: 'small',
            shareDepth: 1,
        });
        const e = vm.generate(g, 7);
        const s = serialize(e);
        const e2 = deserialize(s);
        expect(serialize(e2)).toEqual(s);
    });

    it('rng deterministic', () => {
        const r1 = createRng(99);
        const r2 = createRng(99);
        expect([r1.next(), r1.next()]).toEqual([r2.next(), r2.next()]);
    });
});
