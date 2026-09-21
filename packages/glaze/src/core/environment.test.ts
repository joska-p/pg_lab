import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { createCpuSurface } from '../cpu/CpuSurface';
import { createCamera } from './Camera';
import { createZoomFactor } from './cameraTypes';
import {
    createDocumentCanvas,
    defaultGetDevicePixelRatio,
    resolveDevicePixelRatio,
} from './environment';
import { createDevicePixelRatio } from './render';
import { createMilliseconds } from './time';

describe('core/environment resolver', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('explicit dpr always wins over the injected getter', () => {
        const getter = vi.fn(() => 3);

        expect(resolveDevicePixelRatio(createDevicePixelRatio(2), getter)).toBe(2);
        expect(getter).not.toHaveBeenCalled();
    });

    it('uses the injected getter when no explicit dpr is given', () => {
        expect(resolveDevicePixelRatio(undefined, () => 3)).toBe(3);
    });

    it('falls back to 1 on exotic values instead of throwing at stack creation', () => {
        expect(resolveDevicePixelRatio(undefined, () => 0)).toBe(1);
        expect(resolveDevicePixelRatio(undefined, () => Number.NaN)).toBe(1);
    });

    it('defaults to 1 without window (SSR-safe)', () => {
        expect(defaultGetDevicePixelRatio()).toBe(1);
    });

    it('returns null without document (SSR-safe)', () => {
        expect(createDocumentCanvas()).toBeNull();
    });
});

describe('surface frameLoopOptions injection (Step 4 sealing)', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('forwards a custom schedule to the loop without starting the real rAF chain', () => {
        vi.stubGlobal('window', { addEventListener: () => {}, removeEventListener: () => {} });
        const schedule = vi.fn(() => () => {});
        const canvas = {
            width: 0,
            height: 0,
            clientWidth: 640,
            clientHeight: 480,
            getContext: () => ({ setTransform: () => {} }),
            addEventListener: () => {},
            removeEventListener: () => {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 480 }),
        } as unknown as HTMLCanvasElement;

        const surface = createCpuSurface({
            canvas,
            camera: createCamera(0, 0, createZoomFactor(1)),
            dpr: createDevicePixelRatio(1),
            frameLoopOptions: {
                now: () => createMilliseconds(1000),
                schedule,
            },
        });

        const unsubscribe = surface.onFrame(() => {});

        expect(schedule).toHaveBeenCalledTimes(1);

        unsubscribe();
        surface.destroy();
    });
});
