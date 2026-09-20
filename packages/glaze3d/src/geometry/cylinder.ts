import { Geometry, toIndexArray } from "./geometry";

export class CylinderGeometry extends Geometry {
  constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 32) {
    const radial = Math.max(3, Math.floor(radialSegments));
    const halfHeight = height / 2;
    const ring = radial + 1;
    // Side rows share no vertices with caps (caps need flat +/-Y normals).
    const vertexCount = ring * 2 + (ring + 1) * 2;
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const packed: number[] = [];

    const setVertex = (
      index: number,
      x: number,
      y: number,
      z: number,
      nx: number,
      ny: number,
      nz: number,
    ): void => {
      const o = index * 3;
      positions[o] = x;
      positions[o + 1] = y;
      positions[o + 2] = z;
      normals[o] = nx;
      normals[o + 1] = ny;
      normals[o + 2] = nz;
    };

    // Side: top row 0..radial, bottom row ring..ring+radial.
    for (let i = 0; i <= radial; i++) {
      const theta = (i / radial) * Math.PI * 2;
      const sin = Math.sin(theta);
      const cos = Math.cos(theta);
      setVertex(i, radiusTop * sin, halfHeight, radiusTop * cos, sin, 0, cos);
      setVertex(ring + i, radiusBottom * sin, -halfHeight, radiusBottom * cos, sin, 0, cos);
    }
    for (let i = 0; i < radial; i++) {
      const top = i;
      const topNext = i + 1;
      const bottom = ring + i;
      const bottomNext = ring + i + 1;
      packed.push(top, bottom, topNext, topNext, bottom, bottomNext);
    }

    // Caps: fan around a center vertex, ring duplicated with flat normals.
    const topCenter = ring * 2;
    const topRing = topCenter + 1;
    setVertex(topCenter, 0, halfHeight, 0, 0, 1, 0);
    for (let i = 0; i <= radial; i++) {
      const theta = (i / radial) * Math.PI * 2;
      setVertex(
        topRing + i,
        radiusTop * Math.sin(theta),
        halfHeight,
        radiusTop * Math.cos(theta),
        0,
        1,
        0,
      );
    }
    for (let i = 0; i < radial; i++) {
      packed.push(topCenter, topRing + i, topRing + i + 1);
    }

    const bottomCenter = topRing + ring;
    const bottomRing = bottomCenter + 1;
    setVertex(bottomCenter, 0, -halfHeight, 0, 0, -1, 0);
    for (let i = 0; i <= radial; i++) {
      const theta = (i / radial) * Math.PI * 2;
      setVertex(
        bottomRing + i,
        radiusBottom * Math.sin(theta),
        -halfHeight,
        radiusBottom * Math.cos(theta),
        0,
        -1,
        0,
      );
    }
    for (let i = 0; i < radial; i++) {
      packed.push(bottomCenter, bottomRing + i + 1, bottomRing + i);
    }

    super({ positions, normals, indices: toIndexArray(vertexCount, packed) });
  }
}
