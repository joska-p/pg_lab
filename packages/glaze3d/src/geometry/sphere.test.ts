import { describe, expect, it } from 'vite-plus/test';

import { getOrThrow } from '../core/getOrThrow';
import { checkOutwardWinding } from './check';
import { SphereGeometry } from './sphere';

function normalLengths(normals: Float32Array): number[] {
    const out: number[] = [];
    for (let i = 0; i < normals.length; i += 3) {
        const nx = getOrThrow(normals, i);
        const ny = getOrThrow(normals, i + 1);
        const nz = getOrThrow(normals, i + 2);
        out.push(Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2));
    }
    return out;
}

describe('SphereGeometry', () => {
    it('matches demo tessellation counts (32x20)', () => {
        const geo = new SphereGeometry(0.35, 32, 20);
        expect(geo.vertexCount).toBe(33 * 21);
        expect(geo.data.positions.length).toBe(33 * 21 * 3);
        expect(geo.data.normals.length).toBe(33 * 21 * 3);
        expect(geo.data.indices.length).toBe(32 * 20 * 6);
        expect(geo.data.indices).toBeInstanceOf(Uint16Array);
    });

    it('produces unit normals and positions on the sphere surface', () => {
        const radius = 0.5;
        const geo = new SphereGeometry(radius, 16, 12);
        for (const len of normalLengths(geo.data.normals)) {
            expect(len).toBeCloseTo(1, 5);
        }
        for (let i = 0; i < geo.data.positions.length; i += 3) {
            const x = getOrThrow(geo.data.positions, i);
            const y = getOrThrow(geo.data.positions, i + 1);
            const z = getOrThrow(geo.data.positions, i + 2);
            const len = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
            expect(len).toBeCloseTo(radius, 5);
        }
    });

    it('keeps every index inside vertex bounds', () => {
        const geo = new SphereGeometry(1, 24, 18);
        for (const index of geo.data.indices) {
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(geo.vertexCount);
        }
    });

    it('switches to Uint32 past 65536 vertices', () => {
        const geo = new SphereGeometry(1, 256, 256);
        expect(geo.vertexCount).toBe(257 * 257);
        expect(geo.data.indices).toBeInstanceOf(Uint32Array);
    });

    it('winds non-degenerate faces outward', () => {
        checkOutwardWinding(new SphereGeometry(1, 24, 18).data);
    });
});
