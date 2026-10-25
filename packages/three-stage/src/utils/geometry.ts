import * as THREE from 'three';

const box = {
    label: 'Box',
    geometry: (width = 2, heigh = 2, depth = 2) => new THREE.BoxGeometry(width, heigh, depth),
} as const;

const sphere = {
    label: 'Sphere',
    geometry: () => new THREE.SphereGeometry(2, 8, 8),
} as const;

const cylinder = {
    label: 'Cylinder',
    geometry: () => new THREE.CylinderGeometry(2, 2, 2, 8),
} as const;

const torusKnot = {
    label: 'TorusKnot',
    geometry: () => new THREE.TorusKnotGeometry(1, 0.4, 64, 8, 2, 3),
} as const;

export const geometries = [box, torusKnot, sphere, cylinder] as const;
