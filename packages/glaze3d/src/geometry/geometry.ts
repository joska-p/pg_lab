export interface GeometryData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint16Array | Uint32Array;
}

export function toIndexArray(count: number, filled: number[]): Uint16Array | Uint32Array {
  if (count > 65536) {
    return new Uint32Array(filled);
  }
  return new Uint16Array(filled);
}

export class Geometry {
  data: GeometryData;

  constructor(data: GeometryData) {
    this.data = data;
  }

  get vertexCount(): number {
    return this.data.positions.length / 3;
  }

  get indexCount(): number {
    return this.data.indices.length;
  }
}
