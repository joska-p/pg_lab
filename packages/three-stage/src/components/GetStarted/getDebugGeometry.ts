import * as THREE from 'three';

import type { PresetName } from './getSpawnPoints';

function getDebugGeometry(
    preset: PresetName,
    radius: number,
    circleSegments: number,
    sphereFaces: number,
) {
    switch (preset) {
        case 'circle':
            return new THREE.RingGeometry(radius - 0.02, radius - 0.02, circleSegments);
        case 'fsphere':
            return new THREE.SphereGeometry(radius, circleSegments, sphereFaces);
        case 'tetrahedron':
            return new THREE.TetrahedronGeometry(radius, 0);
        case 'cube':
            return new THREE.BoxGeometry(radius * 1.15, radius * 1.15, radius * 1.15);
        case 'octahedron':
            return new THREE.OctahedronGeometry(radius, 0);
        case 'dodecahedron':
            return new THREE.DodecahedronGeometry(radius, 0);
        case 'icosahedron':
            return new THREE.IcosahedronGeometry(radius, 0);
    }
}

export { getDebugGeometry };
