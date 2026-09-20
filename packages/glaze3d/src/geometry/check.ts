import { expect } from "vite-plus/test";
import type { GeometryData } from "./geometry";

export function checkBounds(data: GeometryData): void {
  const vertexCount = data.positions.length / 3;
  for (const index of data.indices) {
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(vertexCount);
  }
}

export function checkUnitNormals(data: GeometryData): void {
  for (let i = 0; i < data.normals.length; i += 3) {
    const length = Math.hypot(data.normals[i], data.normals[i + 1], data.normals[i + 2]);
    expect(length).toBeCloseTo(1, 5);
  }
}

// Face normal dotted with the face centroid must point outward (away from
// the origin-centered solid) for every non-degenerate triangle. Polar rows
// of the sphere emit zero-area triangles, skipped here.
export function checkOutwardWinding(data: GeometryData): void {
  const { positions, indices } = data;
  for (let t = 0; t < indices.length; t += 3) {
    const ax = positions[indices[t] * 3];
    const ay = positions[indices[t] * 3 + 1];
    const az = positions[indices[t] * 3 + 2];
    const bx = positions[indices[t + 1] * 3];
    const by = positions[indices[t + 1] * 3 + 1];
    const bz = positions[indices[t + 1] * 3 + 2];
    const cx = positions[indices[t + 2] * 3];
    const cy = positions[indices[t + 2] * 3 + 1];
    const cz = positions[indices[t + 2] * 3 + 2];
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
