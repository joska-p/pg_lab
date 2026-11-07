import { COLOR_SPACE_IDS } from '@repo/randomart-core/colors';
import { OP_NAMES } from '@repo/randomart-core/ops';
import { createExpression, createNode } from '@repo/randomart-core/tree';
import { describe, expect, it } from 'vite-plus/test';

import { featuresOf } from './features';
import { flattenFeatures } from './flatten';

describe('flattenFeatures', () => {
    const x = createNode('x', [], { amp: 0.5, phase: 0, cycles: 2 });
    const tree = createNode('add', [x, x]);
    const row = flattenFeatures(featuresOf(createExpression(tree, tree, tree), 'oklch'));

    it('has a column for every operator, zero when absent', () => {
        for (const name of OP_NAMES) {
            expect(row).toHaveProperty([`op.${name}`]);
        }

        expect(row['op.add']).toBe(1);
        expect(row['op.x']).toBe(1);
        expect(row['op.sin']).toBe(0);
    });

    it('one-hot encodes the color space', () => {
        for (const id of COLOR_SPACE_IDS) {
            expect(row[`space.${id}`]).toBe(id === 'oklch' ? 1 : 0);
        }
    });

    it('turns booleans into 0/1 and keeps the scalars', () => {
        expect(row.mono).toBe(1);
        expect(row.animated).toBe(1);
        expect(row.depth).toBe(2);
        expect(row['modulation.count']).toBe(1);
        expect(row['modulation.meanAmp']).toBeCloseTo(0.5);
    });

    it('only contains finite numbers', () => {
        for (const value of Object.values(row)) {
            expect(Number.isFinite(value)).toBe(true);
        }
    });
});
