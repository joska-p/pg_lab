import { describe, expect, it } from 'vite-plus/test';

import { Mat4 } from '../math/mat4';
import { PerspectiveCamera } from './camera';
import { DirectionalLight } from './object3d';

describe('PerspectiveCamera', () => {
    it('builds projectionMatrix from fov/aspect/near/far', () => {
        const camera = new PerspectiveCamera(40, 2, 0.1, 100);
        const expected = Mat4.perspective((40 * Math.PI) / 180, 2, 0.1, 100);
        for (let i = 0; i < 16; i += 1) {
            expect(camera.projectionMatrix.elements[i]).toBeCloseTo(expected.elements[i]);
        }
    });

    it('updateProjectionMatrix reflects parameter changes', () => {
        const camera = new PerspectiveCamera(40, 1, 0.01, 200);
        camera.aspect = 2;
        camera.updateProjectionMatrix();
        const expected = Mat4.perspective((40 * Math.PI) / 180, 2, 0.01, 200);
        expect(camera.projectionMatrix.elements[0]).toBeCloseTo(expected.elements[0]);
    });

    it('matrixWorldInverse inverts matrixWorld', () => {
        const camera = new PerspectiveCamera(40, 1, 0.01, 200);
        camera.position.set(0, 0, 5);
        camera.updateMatrixWorld();
        expect(camera.matrixWorld.elements[14]).toBeCloseTo(5);
        expect(camera.matrixWorldInverse.elements[14]).toBeCloseTo(-5);
        const roundtrip = camera.matrixWorld.clone().multiply(camera.matrixWorldInverse);
        const identity = Mat4.identity();
        for (let i = 0; i < 16; i += 1) {
            expect(roundtrip.elements[i]).toBeCloseTo(identity.elements[i]);
        }
    });

    it('light attached to camera follows it (decisive S2 test)', () => {
        const camera = new PerspectiveCamera(40, 1, 0.01, 200);
        const light = new DirectionalLight([1, 1, 1], 1);
        camera.position.set(4, 3, 11);
        light.position.set(1, 0, 0);
        camera.add(light);
        camera.updateMatrixWorld();
        // Camera world position is kept, and the child light inherits it plus offset.
        expect(camera.matrixWorld.elements[12]).toBeCloseTo(4);
        expect(light.matrixWorld.elements[12]).toBeCloseTo(5);
        expect(light.matrixWorld.elements[13]).toBeCloseTo(3);
        expect(light.matrixWorld.elements[14]).toBeCloseTo(11);
        // View matrix stays the inverse of the camera world matrix.
        expect(camera.matrixWorldInverse.elements[12]).toBeCloseTo(-4);
    });
});
