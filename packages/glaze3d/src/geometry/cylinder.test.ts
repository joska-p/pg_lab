import { describe, expect, it } from 'vite-plus/test';

import { checkOutwardWinding } from './check';
import { CylinderGeometry } from './cylinder';

describe('CylinderGeometry', () => {
    it('matches bond tessellation counts (radial 16, closed caps)', () => {
        const geo = new CylinderGeometry(0.065, 0.065, 2, 16);
        // Side (17*2) + top cap (1+17) + bottom cap (1+17).
        expect(geo.vertexCount).toBe(34 + 18 + 18);
        expect(geo.data.positions.length).toBe(70 * 3);
        // Side 16*6 + caps 2*16*3.
        expect(geo.data.indices.length).toBe(96 + 96);
        expect(geo.data.indices).toBeInstanceOf(Uint16Array);
    });

    it('produces unit normals and respects height extent', () => {
        const geo = new CylinderGeometry(0.065, 0.065, 2.5, 16);
        for (let i = 0; i < geo.data.normals.length; i += 3) {
            const len = Math.sqrt(
                geo.data.normals[i] ** 2 +
                    geo.data.normals[i + 1] ** 2 +
                    geo.data.normals[i + 2] ** 2,
            );
            expect(len).toBeCloseTo(1, 5);
        }
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 1; i < geo.data.positions.length; i += 3) {
            minY = Math.min(minY, geo.data.positions[i]);
            maxY = Math.max(maxY, geo.data.positions[i]);
        }
        expect(minY).toBeCloseTo(-1.25, 5);
        expect(maxY).toBeCloseTo(1.25, 5);
    });

    it('supports tapered radii on side rings', () => {
        const geo = new CylinderGeometry(1, 2, 3, 8);
        const ring = 9;
        // First side vertex sits on the top ring (radiusTop).
        expect(Math.sqrt(geo.data.positions[0] ** 2 + geo.data.positions[2] ** 2)).toBeCloseTo(
            1,
            5,
        );
        // First bottom-row side vertex sits on the bottom ring (radiusBottom).
        const o = ring * 3;
        expect(Math.sqrt(geo.data.positions[o] ** 2 + geo.data.positions[o + 2] ** 2)).toBeCloseTo(
            2,
            5,
        );
    });

    it('keeps every index inside vertex bounds', () => {
        const geo = new CylinderGeometry(0.5, 0.5, 1, 12);
        for (const index of geo.data.indices) {
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(geo.vertexCount);
        }
    });

    it('winds every face outward', () => {
        checkOutwardWinding(new CylinderGeometry(0.5, 0.5, 1, 12).data);
    });
});
