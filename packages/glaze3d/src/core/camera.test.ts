import { describe, expect, it } from 'vite-plus/test';

import { Mat4 } from '../math/mat4';
import { PerspectiveCamera } from './camera';
import { getOrThrow } from './getOrThrow';
import { DirectionalLight } from './object3d';

describe('PerspectiveCamera', () => {
    it('builds projectionMatrix from fov/aspect/near/far', () => {
        const camera = new PerspectiveCamera(40, 2, 0.1, 100);
        const expected = Mat4.perspective((40 * Math.PI) / 180, 2, 0.1, 100);
        for (const [i, value] of camera.projectionMatrix.elements.entries()) {
            expect(value).toBeCloseTo(getOrThrow(expected.elements, i));
        }
    });

    it('updateProjectionMatrix reflects parameter changes', () => {
        const camera = new PerspectiveCamera(40, 1, 0.01, 200);
        camera.aspect = 2;
        camera.updateProjectionMatrix();
        const expected = Mat4.perspective((40 * Math.PI) / 180, 2, 0.01, 200);
        expect(getOrThrow(camera.projectionMatrix.elements, 0)).toBeCloseTo(
            getOrThrow(expected.elements, 0),
        );
    });

    it('matrixWorldInverse inverts matrixWorld', () => {
        const camera = new PerspectiveCamera(40, 1, 0.01, 200);
        camera.position.set(0, 0, 5);
        camera.updateMatrixWorld();
        expect(getOrThrow(camera.matrixWorld.elements, 14)).toBeCloseTo(5);
        expect(getOrThrow(camera.matrixWorldInverse.elements, 14)).toBeCloseTo(-5);
        const roundtrip = camera.matrixWorld.clone().multiply(camera.matrixWorldInverse);
        const identity = Mat4.identity();
        for (const [i, value] of roundtrip.elements.entries()) {
            expect(value).toBeCloseTo(getOrThrow(identity.elements, i));
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
        expect(getOrThrow(camera.matrixWorld.elements, 12)).toBeCloseTo(4);
        expect(getOrThrow(light.matrixWorld.elements, 12)).toBeCloseTo(5);
        expect(getOrThrow(light.matrixWorld.elements, 13)).toBeCloseTo(3);
        expect(getOrThrow(light.matrixWorld.elements, 14)).toBeCloseTo(11);
        // View matrix stays the inverse of the camera world matrix.
        expect(getOrThrow(camera.matrixWorldInverse.elements, 12)).toBeCloseTo(-4);
    });
});
