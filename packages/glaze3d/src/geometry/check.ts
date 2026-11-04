import { expect } from 'vite-plus/test';

import { getOrThrow } from '../core/getOrThrow';
import type { GeometryData } from './geometry';

export function checkBounds(data: GeometryData): void {
    const vertexCount = data.positions.length / 3;
    for (const index of data.indices) {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(vertexCount);
    }
}

export function checkUnitNormals(data: GeometryData): void {
    for (let i = 0; i < data.normals.length; i += 3) {
        const nx = getOrThrow(data.normals, i);
        const ny = getOrThrow(data.normals, i + 1);
        const nz = getOrThrow(data.normals, i + 2);
        const length = Math.hypot(nx, ny, nz);
        expect(length).toBeCloseTo(1, 5);
    }
}

// Face normal dotted with the face centroid must point outward (away from
// the origin-centered solid) for every non-degenerate triangle. Polar rows
// of the sphere emit zero-area triangles, skipped here.
export function checkOutwardWinding(data: GeometryData): void {
    const { positions, indices } = data;
    for (let t = 0; t < indices.length; t += 3) {
        const ia = getOrThrow(indices, t);
        const ib = getOrThrow(indices, t + 1);
        const ic = getOrThrow(indices, t + 2);
        const ax = getOrThrow(positions, ia * 3);
        const ay = getOrThrow(positions, ia * 3 + 1);
        const az = getOrThrow(positions, ia * 3 + 2);
        const bx = getOrThrow(positions, ib * 3);
        const by = getOrThrow(positions, ib * 3 + 1);
        const bz = getOrThrow(positions, ib * 3 + 2);
        const cx = getOrThrow(positions, ic * 3);
        const cy = getOrThrow(positions, ic * 3 + 1);
        const cz = getOrThrow(positions, ic * 3 + 2);
        const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
        const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
        const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        const centroidX = (ax + bx + cx) / 3;
        const centroidY = (ay + by + cy) / 3;
        const centroidZ = (az + bz + cz) / 3;
        if (nx * nx + ny * ny + nz * nz < 1e-24) {
            continue;
        }
        expect(nx * centroidX + ny * centroidY + nz * centroidZ).toBeGreaterThan(0);
    }
}
