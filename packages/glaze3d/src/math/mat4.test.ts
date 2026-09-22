import { describe, expect, it } from 'vite-plus/test';

import { Mat4 } from './mat4';
import { Quat } from './quat';
import { Vec3 } from './vec3';

describe('Mat4', () => {
    it('stores column-major identity', () => {
        const m = Mat4.identity();
        expect(m.elements.length).toBe(16);
        expect([...m.elements]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    });

    it('perspective matches WebGL column-major layout', () => {
        const m = Mat4.perspective(Math.PI / 2, 2, 0.1, 100);
        const te = m.elements;
        expect(te[0]).toBeCloseTo(0.5);
        expect(te[5]).toBeCloseTo(1);
        expect(te[11]).toBe(-1);
        expect(te[15]).toBe(0);
        expect(te[10]).toBeCloseTo((100 + 0.1) / (0.1 - 100));
    });

    it('compose encodes position with identity rotation/scale', () => {
        const m = new Mat4().compose(new Vec3(4, 3, 11), new Quat());
        expect(m.elements[12]).toBe(4);
        expect(m.elements[13]).toBe(3);
        expect(m.elements[14]).toBe(11);
        expect(m.elements[0]).toBeCloseTo(1);
        expect(m.elements[5]).toBeCloseTo(1);
        expect(m.elements[10]).toBeCloseTo(1);
    });

    it('multiply chains translation as this * m', () => {
        const a = new Mat4().compose(new Vec3(1, 0, 0), new Quat());
        const b = new Mat4().compose(new Vec3(0, 2, 0), new Quat());
        a.multiply(b);
        expect(a.elements[12]).toBeCloseTo(1);
        expect(a.elements[13]).toBeCloseTo(2);
        expect(a.elements[14]).toBeCloseTo(0);
    });

    it('invert undoes compose', () => {
        const m = new Mat4().compose(new Vec3(4, 3, 11), new Quat(), new Vec3(2, 2, 2));
        const inv = m.clone().invert();
        const product = m.clone().multiply(inv);
        const identity = Mat4.identity().elements;
        for (let i = 0; i < 16; i += 1) {
            expect(product.elements[i]).toBeCloseTo(identity[i], 5);
        }
    });
});
