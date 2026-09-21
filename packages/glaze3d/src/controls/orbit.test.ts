import { describe, expect, it } from 'vite-plus/test';

import { PerspectiveCamera } from '../core/camera';
import type { Quat } from '../math/quat';
import { Vec3 } from '../math/vec3';
import { OrbitControls } from './orbit';

type Handler = (event: Record<string, unknown>) => void;

interface FakeElement {
    handlers: Map<string, Set<Handler>>;
    addEventListener(type: string, fn: Handler): void;
    removeEventListener(type: string, fn: Handler): void;
    dispatch(type: string, event: Record<string, unknown>): void;
}

function createFakeElement(): FakeElement {
    const handlers = new Map<string, Set<Handler>>();
    return {
        handlers,
        addEventListener(type: string, fn: Handler): void {
            let set = handlers.get(type);
            if (set === undefined) {
                set = new Set();
                handlers.set(type, set);
            }
            set.add(fn);
        },
        removeEventListener(type: string, fn: Handler): void {
            handlers.get(type)?.delete(fn);
        },
        dispatch(type: string, event: Record<string, unknown>): void {
            for (const fn of handlers.get(type) ?? []) {
                fn(event);
            }
        },
    };
}

interface FakeWindow {
    handlers: Map<string, Set<Handler>>;
    addEventListener(type: string, fn: Handler): void;
    removeEventListener(type: string, fn: Handler): void;
}

function installFakeWindow(): FakeWindow {
    const handlers = new Map<string, Set<Handler>>();
    const fake: FakeWindow = {
        handlers,
        addEventListener(type: string, fn: Handler): void {
            let set = handlers.get(type);
            if (set === undefined) {
                set = new Set();
                handlers.set(type, set);
            }
            set.add(fn);
        },
        removeEventListener(type: string, fn: Handler): void {
            handlers.get(type)?.delete(fn);
        },
    };
    (globalThis as unknown as { window?: FakeWindow }).window = fake;
    return fake;
}

function moveOnWindow(fake: FakeWindow, event: Record<string, unknown>): void {
    for (const fn of fake.handlers.get('pointermove') ?? []) {
        fn(event);
    }
}

function upOnWindow(fake: FakeWindow): void {
    for (const fn of fake.handlers.get('pointerup') ?? []) {
        fn({});
    }
}

function demoCamera(): PerspectiveCamera {
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    camera.position.set(4, 3, 11);
    camera.updateMatrixWorld();
    return camera;
}

function radiusOf(camera: PerspectiveCamera): number {
    return camera.position.length();
}

function applyQuat(v: Vec3, q: Quat): Vec3 {
    const x = v.x;
    const y = v.y;
    const z = v.z;
    const ix = q.w * x + q.y * z - q.z * y;
    const iy = q.w * y + q.z * x - q.x * z;
    const iz = q.w * z + q.x * y - q.y * x;
    const iw = -q.x * x - q.y * y - q.z * z;
    return new Vec3(
        ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
        iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
        iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
    );
}

describe('OrbitControls', () => {
    it('drags to rotate around the origin and fires change', () => {
        const fakeWindow = installFakeWindow();
        const element = createFakeElement();
        const camera = demoCamera();
        const before = camera.position.clone();
        const controls = new OrbitControls(camera, element as unknown as HTMLElement);
        let changes = 0;
        controls.addEventListener('change', () => {
            changes += 1;
        });

        element.dispatch('pointerdown', { button: 0, clientX: 100, clientY: 100, pointerId: 1 });
        moveOnWindow(fakeWindow, { clientX: 200, clientY: 100 });
        upOnWindow(fakeWindow);
        controls.update();

        expect(camera.position.x).not.toBeCloseTo(before.x);
        expect(radiusOf(camera)).toBeCloseTo(before.length(), 5);
        expect(changes).toBe(1);
        // matrixWorldInverse stays fresh for external pattern readers (A6).
        const product = camera.matrixWorldInverse.clone().multiply(camera.matrixWorld);
        expect(product.elements[0]).toBeCloseTo(1, 4);
        expect(product.elements[5]).toBeCloseTo(1, 4);
        expect(product.elements[10]).toBeCloseTo(1, 4);
        controls.dispose();
    });

    it('keeps the camera looking at the origin after rotation', () => {
        const fakeWindow = installFakeWindow();
        const element = createFakeElement();
        const camera = demoCamera();
        const controls = new OrbitControls(camera, element as unknown as HTMLElement, {
            enableDamping: false,
        });

        element.dispatch('pointerdown', { button: 0, clientX: 50, clientY: 50, pointerId: 1 });
        moveOnWindow(fakeWindow, { clientX: 150, clientY: 120 });
        upOnWindow(fakeWindow);
        controls.update();

        const forward = applyQuat(new Vec3(0, 0, -1), camera.quaternion).normalize();
        const toOrigin = camera.position.clone().normalize();
        expect(forward.x).toBeCloseTo(-toOrigin.x, 4);
        expect(forward.y).toBeCloseTo(-toOrigin.y, 4);
        expect(forward.z).toBeCloseTo(-toOrigin.z, 4);
        controls.dispose();
    });

    it('applies drag fully without damping and settles on the next frame', () => {
        const fakeWindow = installFakeWindow();
        const element = createFakeElement();
        const camera = demoCamera();
        const controls = new OrbitControls(camera, element as unknown as HTMLElement, {
            enableDamping: false,
        });
        let changes = 0;
        controls.addEventListener('change', () => {
            changes += 1;
        });

        element.dispatch('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 });
        moveOnWindow(fakeWindow, { clientX: 100, clientY: 0 });
        upOnWindow(fakeWindow);
        controls.update();
        const afterFirst = camera.position.clone();
        controls.update();

        expect(afterFirst.x).not.toBeCloseTo(4);
        expect(camera.position.x).toBeCloseTo(afterFirst.x);
        expect(changes).toBe(1);
        controls.dispose();
    });

    it('carries inertia after release when damping is enabled', () => {
        const fakeWindow = installFakeWindow();
        const element = createFakeElement();
        const camera = demoCamera();
        const controls = new OrbitControls(camera, element as unknown as HTMLElement, {
            enableDamping: true,
            dampingFactor: 0.07,
        });

        element.dispatch('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 });
        moveOnWindow(fakeWindow, { clientX: 100, clientY: 0 });
        upOnWindow(fakeWindow);
        controls.update();
        const afterFirst = camera.position.clone();
        controls.update();

        // Decayed delta still moves the camera on the following frame.
        expect(camera.position.x).not.toBeCloseTo(afterFirst.x);
        controls.dispose();
    });

    it('auto-rotates every frame with the demo speed', () => {
        installFakeWindow();
        const element = createFakeElement();
        const camera = demoCamera();
        // Demo-compatible mutable flags (mol-demo.js.txt:717-722).
        const controls = new OrbitControls(camera, element as unknown as HTMLElement);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.75;
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        let changes = 0;
        controls.addEventListener('change', () => {
            changes += 1;
        });

        controls.update();
        const afterFirst = camera.position.clone();
        controls.update();

        expect(afterFirst.x).not.toBeCloseTo(4);
        expect(camera.position.x).not.toBeCloseTo(afterFirst.x);
        expect(radiusOf(camera)).toBeCloseTo(afterFirst.length(), 6);
        expect(changes).toBe(2);
        controls.dispose();
    });

    it('dollies on wheel when zoom is enabled and ignores it when disabled', () => {
        installFakeWindow();
        const element = createFakeElement();
        const camera = demoCamera();
        const before = radiusOf(camera);
        const controls = new OrbitControls(camera, element as unknown as HTMLElement, {
            enableDamping: false,
            enableZoom: true,
        });
        let prevented = false;
        element.dispatch('wheel', {
            deltaY: -100,
            preventDefault: () => {
                prevented = true;
            },
        });
        controls.update();
        expect(prevented).toBe(true);
        expect(radiusOf(camera)).toBeLessThan(before);

        const fixedCamera = demoCamera();
        const fixedControls = new OrbitControls(fixedCamera, element as unknown as HTMLElement, {
            enableDamping: false,
            enableZoom: false,
        });
        let fixedChanges = 0;
        fixedControls.addEventListener('change', () => {
            fixedChanges += 1;
        });
        element.dispatch('wheel', { deltaY: -100, preventDefault: () => {} });
        fixedControls.update();
        expect(radiusOf(fixedCamera)).toBeCloseTo(before, 6);
        expect(fixedChanges).toBe(0);
        controls.dispose();
        fixedControls.dispose();
    });

    it('dispose detaches listeners and stops camera updates', () => {
        const fakeWindow = installFakeWindow();
        const element = createFakeElement();
        const camera = demoCamera();
        const controls = new OrbitControls(camera, element as unknown as HTMLElement, {
            enableDamping: false,
        });
        controls.dispose();

        expect(element.handlers.get('pointerdown')?.size ?? 0).toBe(0);
        expect(element.handlers.get('wheel')?.size ?? 0).toBe(0);
        element.dispatch('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 });
        expect(fakeWindow.handlers.get('pointermove')?.size ?? 0).toBe(0);
        const before = camera.position.clone();
        controls.update();
        expect(camera.position.x).toBeCloseTo(before.x);
    });
});
