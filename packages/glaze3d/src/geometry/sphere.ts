import { Geometry, toIndexArray } from './geometry';

export class SphereGeometry extends Geometry {
    constructor(radius = 1, widthSegments = 32, heightSegments = 16) {
        const width = Math.max(3, Math.floor(widthSegments));
        const height = Math.max(2, Math.floor(heightSegments));
        const row = width + 1;
        const vertexCount = row * (height + 1);

        const positions = new Float32Array(vertexCount * 3);
        const normals = new Float32Array(vertexCount * 3);
        const packed: number[] = [];

        for (let iy = 0; iy <= height; iy++) {
            const v = iy / height;
            const theta = v * Math.PI;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            for (let ix = 0; ix <= width; ix++) {
                const u = ix / width;
                const phi = u * Math.PI * 2;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                // Matches three.js SphereGeometry orientation (right-handed).
                const nx = -cosPhi * sinTheta;
                const ny = cosTheta;
                const nz = sinPhi * sinTheta;
                const o = (iy * row + ix) * 3;
                positions[o] = radius * nx;
                positions[o + 1] = radius * ny;
                positions[o + 2] = radius * nz;
                normals[o] = nx;
                normals[o + 1] = ny;
                normals[o + 2] = nz;
            }
        }

        for (let iy = 0; iy < height; iy++) {
            for (let ix = 0; ix < width; ix++) {
                const a = ix + row * iy;
                const b = ix + row * (iy + 1);
                const c = ix + 1 + row * (iy + 1);
                const d = ix + 1 + row * iy;
                packed.push(a, b, d, b, c, d);
            }
        }

        super({ positions, normals, indices: toIndexArray(vertexCount, packed) });
    }
}
