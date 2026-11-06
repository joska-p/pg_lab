import { describe, expect, it } from 'vite-plus/test';

import { RandomArtError } from './errors';
import { createRng } from './rng';
import type { Rng } from './rng';
import { createSeed } from './seed';

function seedOf(value: string) {
    return createSeed(value);
}

describe('Rng.pick', () => {
    it('draws only items of the list, deterministically for a fixed seed', () => {
        const rng: Rng = createRng(seedOf('fixed-pick-seed'));
        const items = ['a', 'b', 'c'];
        const drawn = new Set<string>();
        for (let i = 0; i < 50; i++) {
            drawn.add(rng.pick(items));
        }
        for (const item of drawn) {
            expect(items).toContain(item);
        }
        expect(drawn.size).toBeGreaterThan(1);
    });

    it('throws on an empty list with a dedicated message', () => {
        const rng: Rng = createRng(seedOf('any-seed'));
        expect(() => rng.pick([])).toThrow(RandomArtError);
        expect(() => rng.pick([])).toThrow('cannot draw from an empty list');
    });

    it('two rngs of the same seed produce the same pick sequence', () => {
        const a = createRng(seedOf('same-seed'));
        const b = createRng(seedOf('same-seed'));
        const items = ['a', 'b', 'c'];
        for (let i = 0; i < 20; i++) {
            expect(a.pick(items)).toBe(b.pick(items));
        }
    });
});
