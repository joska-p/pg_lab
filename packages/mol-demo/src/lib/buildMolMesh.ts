// Molecule mesh builder. Ports buildMolMesh from mol-demo.js onto glaze3d:
// spheres per atom + cylinders per bond, added to a caller-owned Group.
// The caller owns molGroup's lifecycle (clear/rebuild on switch); this
// module only populates it, so it stays UI- and GL-free and testable.

import { Group, Mesh } from '@repo/glaze3d/core';
import { CylinderGeometry, SphereGeometry } from '@repo/glaze3d/geometry';
import { PhongMaterial } from '@repo/glaze3d/material';
import { Vec3 } from '@repo/glaze3d/math';

import { atomDisplay } from './atoms';
import type { Molecule } from './parseMol';

export const ATOM_SPHERE_SCALE = 0.45;
export const ATOM_SPHERE_WIDTH_SEGS = 32;
export const ATOM_SPHERE_HEIGHT_SEGS = 20;
export const BOND_RADIUS = 0.065;
export const BOND_RADIAL_SEGS = 16;
export const BOND_COLOR = 0x888888;
export const BOND_SHININESS = 70;
export const ATOM_SHININESS = 100;
export const ATOM_SPECULAR = 0x333333;

const UP = new Vec3(0, 1, 0);

function atomMesh(el: string, pos: readonly [number, number, number]): Mesh {
    const { r, col } = atomDisplay(el);
    const geometry = new SphereGeometry(
        r * ATOM_SPHERE_SCALE,
        ATOM_SPHERE_WIDTH_SEGS,
        ATOM_SPHERE_HEIGHT_SEGS,
    );
    const material = new PhongMaterial({
        color: col,
        shininess: ATOM_SHININESS,
        specular: ATOM_SPECULAR,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    return mesh;
}

function bondMesh(
    a: readonly [number, number, number],
    b: readonly [number, number, number],
): Mesh | null {
    const p1 = Vec3.fromArray([a[0], a[1], a[2]]);
    const p2 = Vec3.fromArray([b[0], b[1], b[2]]);
    const dir = Vec3.subVectors(p2, p1);
    const len = dir.length();
    if (!(len > 1e-9)) return null;
    const mid = p1.clone().lerp(p2, 0.5);
    const geometry = new CylinderGeometry(BOND_RADIUS, BOND_RADIUS, len, BOND_RADIAL_SEGS);
    const material = new PhongMaterial({ color: BOND_COLOR, shininess: BOND_SHININESS });
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
    return mesh;
}

// Replaces molGroup's children with the molecule's meshes. Old geometries
// stay reachable only via the renderer's WeakMap cache, so they are
// collectable once cleared — no explicit dispose step.
export function buildMolMesh(molGroup: Group, mol: Molecule): void {
    molGroup.clear();
    mol.atoms.forEach((el, i) => {
        const pos = mol.pos[i];
        if (pos === undefined) return;
        molGroup.add(atomMesh(el, pos));
    });
    for (const [a, b] of mol.bonds) {
        const pa = mol.pos[a];
        const pb = mol.pos[b];
        if (pa === undefined || pb === undefined) continue;
        const mesh = bondMesh(pa, pb);
        if (mesh !== null) molGroup.add(mesh);
    }
}
