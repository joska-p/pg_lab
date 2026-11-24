import * as THREE from 'three';

const standard = {
    label: 'Standard',
    material: () => new THREE.MeshStandardMaterial(),
} as const;

const basic = {
    label: 'Basic',
    material: () => new THREE.MeshBasicMaterial(),
} as const;

const lambert = {
    label: 'Lambert',
    material: () => new THREE.MeshLambertMaterial(),
} as const;

const normal = {
    label: 'Normal',
    material: () => new THREE.MeshNormalMaterial(),
} as const;

const phong = {
    label: 'Phong',
    material: () => new THREE.MeshPhongMaterial(),
} as const;

const toon = {
    label: 'Toon',
    material: () => new THREE.MeshToonMaterial(),
} as const;

const depth = {
    label: 'Depth',
    material: () => new THREE.MeshDepthMaterial(),
};

export const materials = [standard, toon, basic, lambert, normal, phong, depth] as const;
