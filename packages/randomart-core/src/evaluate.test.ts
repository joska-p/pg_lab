import { describe, expect, it } from 'vite-plus/test';

import { evaluate } from './evaluate';
import { generate } from './generate';
import type { Point } from './ops';
import { EPS, seedOf, SIZE_GRAMMARS } from './testing/fixtures';

const CHANNELS = ['r', 'g', 'b'] as const;

/** Spread of seeds shared with emit.test.ts. */
const SEEDS = [0, 1, 2, 7, 42, 99] as const;

/** Deterministic probes covering the corners and the interior of [-1, 1]², at several phases. */
const PROBE_POINTS: readonly Point[] = [-1, 0, 1].flatMap((x) =>
    [-1, 0, 0.63].map((y) => ({ x, y, phase: (x + y + 2) / 4 })),
);

describe('evaluate', () => {
    it('keeps every evaluated channel finite and inside [-1, 1]', () => {
        for (const grammar of SIZE_GRAMMARS) {
            for (const seed of SEEDS) {
                const expression = generate(grammar, seedOf(seed));
                const label = `${grammar.minDepth}/${grammar.maxDepth}/${grammar.maxNodes}/seed ${seed}`;

                for (const point of PROBE_POINTS) {
                    const rgb = evaluate(expression, point);

                    for (const channel of CHANNELS) {
                        const value = rgb[channel];
                        const at = `${label} at (${point.x}, ${point.y}, ${point.phase}) ${channel}=${value}`;

                        expect(Number.isFinite(value), at).toBe(true);
                        expect(value, at).toBeGreaterThanOrEqual(-1 - EPS);
                        expect(value, at).toBeLessThanOrEqual(1 + EPS);
                    }
                }
            }
        }
    });
});
