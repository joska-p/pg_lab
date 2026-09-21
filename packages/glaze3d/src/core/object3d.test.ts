import { describe, expect, it } from 'vite-plus/test';

import { DirectionalLight, Group, Mesh, Object3D } from './object3d';

describe('Object3D hierarchy', () => {
    it('add/remove maintain parent links', () => {
        const parent = new Object3D();
        const child = new Object3D();
        parent.add(child);
        expect(child.parent).toBe(parent);
        expect(parent.children).toContain(child);
        parent.remove(child);
        expect(child.parent).toBeNull();
        expect(parent.children).not.toContain(child);
    });

    it('add reparents from the previous parent', () => {
        const a = new Object3D();
        const b = new Object3D();
        const child = new Object3D();
        a.add(child);
        b.add(child);
        expect(child.parent).toBe(b);
        expect(a.children).not.toContain(child);
        expect(b.children).toContain(child);
    });

    it('clear empties children for molecule swap', () => {
        const group = new Group();
        const a = new Mesh();
        const b = new Mesh();
        group.add(a).add(b);
        group.clear();
        expect(group.children).toHaveLength(0);
        expect(a.parent).toBeNull();
        expect(b.parent).toBeNull();
    });

    it('updateMatrix composes local translation', () => {
        const obj = new Object3D();
        obj.position.set(1, 2, 3);
        obj.updateMatrix();
        expect(obj.matrix.elements[12]).toBeCloseTo(1);
        expect(obj.matrix.elements[13]).toBeCloseTo(2);
        expect(obj.matrix.elements[14]).toBeCloseTo(3);
    });

    it('updateMatrixWorld accumulates parent transforms', () => {
        const parent = new Object3D();
        const child = new Object3D();
        parent.position.set(1, 0, 0);
        child.position.set(0, 2, 0);
        parent.add(child);
        parent.updateMatrixWorld();
        expect(child.matrixWorld.elements[12]).toBeCloseTo(1);
        expect(child.matrixWorld.elements[13]).toBeCloseTo(2);
        expect(child.matrixWorld.elements[14]).toBeCloseTo(0);
    });

    it('updateMatrixWorld propagates parent scale', () => {
        const parent = new Object3D();
        const child = new Object3D();
        parent.scale.set(2, 2, 2);
        child.position.set(1, 0, 0);
        parent.add(child);
        parent.updateMatrixWorld();
        expect(child.matrixWorld.elements[12]).toBeCloseTo(2);
    });

    it('light attached to a parent follows its matrixWorld', () => {
        const rig = new Object3D();
        const light = new DirectionalLight([1, 1, 1], 1);
        rig.position.set(4, 3, 11);
        light.position.set(0, 1, 0);
        rig.add(light);
        rig.updateMatrixWorld();
        expect(light.matrixWorld.elements[12]).toBeCloseTo(4);
        expect(light.matrixWorld.elements[13]).toBeCloseTo(4);
        expect(light.matrixWorld.elements[14]).toBeCloseTo(11);
    });
});
