import { Euler, Quaternion, Vector3 } from 'three';

export interface SpawnPoint {
    id: number;
    position: Vector3;
    rotation: Euler;
}

const LOCAL_UP = new Vector3(0, 1, 0);

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618

// Pure raw vertex coordinate arrays before normalization
const VERTEX_PRESETS: Record<string, number[][]> = {
    // 4 Vertices
    tetrahedron: [
        [1, 1, 1],
        [1, -1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
    ],
    // 8 Vertices
    cube: [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, 1],
        [-1, -1, -1],
    ],
    // 6 Vertices
    octahedron: [
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0],
        [0, 0, 1],
        [0, 0, -1],
    ],
    // 20 Vertices
    dodecahedron: [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, 1],
        [-1, -1, -1],
        [0, 1 / GOLDEN_RATIO, GOLDEN_RATIO],
        [0, 1 / GOLDEN_RATIO, -GOLDEN_RATIO],
        [0, -1 / GOLDEN_RATIO, GOLDEN_RATIO],
        [0, -1 / GOLDEN_RATIO, -GOLDEN_RATIO],
        [1 / GOLDEN_RATIO, GOLDEN_RATIO, 0],
        [1 / GOLDEN_RATIO, -GOLDEN_RATIO, 0],
        [-1 / GOLDEN_RATIO, GOLDEN_RATIO, 0],
        [-1 / GOLDEN_RATIO, -GOLDEN_RATIO, 0],
        [GOLDEN_RATIO, 0, 1 / GOLDEN_RATIO],
        [GOLDEN_RATIO, 0, -1 / GOLDEN_RATIO],
        [-GOLDEN_RATIO, 0, 1 / GOLDEN_RATIO],
        [-GOLDEN_RATIO, 0, -1 / GOLDEN_RATIO],
    ],
    // 12 Vertices (Perfectly round, clean distribution)
    icosahedron: [
        [0, 1, GOLDEN_RATIO],
        [0, 1, -GOLDEN_RATIO],
        [0, -1, GOLDEN_RATIO],
        [0, -1, -GOLDEN_RATIO],
        [1, GOLDEN_RATIO, 0],
        [1, -GOLDEN_RATIO, 0],
        [-1, GOLDEN_RATIO, 0],
        [-1, -GOLDEN_RATIO, 0],
        [GOLDEN_RATIO, 0, 1],
        [GOLDEN_RATIO, 0, -1],
        [-GOLDEN_RATIO, 0, 1],
        [-GOLDEN_RATIO, 0, -1],
    ],
};

export type PresetName =
    | 'circle'
    | 'fsphere'
    | 'tetrahedron'
    | 'cube'
    | 'octahedron'
    | 'dodecahedron'
    | 'icosahedron';

interface GetSpawnPointsProps {
    preset: PresetName;
    radius: number;
    offset: number;
    circleSegments: number;
    fsphereFaces: number;
}

export function getSpawnPoints({
    preset,
    radius,
    offset,
    circleSegments,
    fsphereFaces,
}: GetSpawnPointsProps): SpawnPoint[] {
    const points: SpawnPoint[] = [];
    const totalDistance = radius + offset;

    // 1. Handle flat 2D ring spawning
    if (preset === 'circle') {
        for (let i = 0; i < circleSegments; i++) {
            const angle = (i / circleSegments) * Math.PI * 2;
            const normal = new Vector3(Math.cos(angle), 0, Math.sin(angle));

            points.push({
                id: i,
                position: normal.clone().multiplyScalar(totalDistance),
                rotation: new Euler().setFromQuaternion(
                    new Quaternion().setFromUnitVectors(LOCAL_UP, normal),
                ),
            });
        }

        return points;
    }

    // 2. Handle spherical spawning
    if (preset === 'fsphere') {
        for (let i = 0; i < fsphereFaces; i++) {
            const y = 1 - (i / (fsphereFaces - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = (i * Math.PI * (3 - Math.sqrt(5))) % (2 * Math.PI);
            const normal = new Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);

            points.push({
                id: i,
                position: normal.clone().multiplyScalar(totalDistance),
                rotation: new Euler().setFromQuaternion(
                    new Quaternion().setFromUnitVectors(LOCAL_UP, normal),
                ),
            });
        }

        return points;
    }

    // 3. Handle pure mathematical vertex processing
    const rawVertices = VERTEX_PRESETS[preset];
    const vertexVec = new Vector3();
    let idCounter = 0;

    for (const vertex of rawVertices) {
        vertexVec.fromArray(vertex).normalize();

        const position = vertexVec.clone().multiplyScalar(totalDistance);
        const rotation = new Euler().setFromQuaternion(
            new Quaternion().setFromUnitVectors(LOCAL_UP, vertexVec),
        );

        points.push({ id: idCounter++, position, rotation });
    }

    return points;
}
