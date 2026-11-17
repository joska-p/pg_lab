import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { applyCanvasSize, measureCanvas, resolveDpr } from './canvasSize';

describe('resolveDpr', () => {
    it('returns explicit dpr override when provided', () => {
        vi.stubGlobal('window', { devicePixelRatio: 3 });
        expect(resolveDpr(1.5)).toBe(1.5);
    });

    it('reads window.devicePixelRatio when no override is given', () => {
        vi.stubGlobal('window', { devicePixelRatio: 2 });
        expect(resolveDpr()).toBe(2);
    });

    it('falls back to 1 when window is undefined', () => {
        vi.stubGlobal('window', undefined);
        expect(resolveDpr()).toBe(1);
    });

    it('falls back to 1 when window.devicePixelRatio is undefined', () => {
        vi.stubGlobal('window', {});
        expect(resolveDpr()).toBe(1);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });
});

describe('measureCanvas', () => {
    it('derives CSS and device dimensions using getBoundingClientRect', () => {
        const canvas = {
            getBoundingClientRect: () => ({ width: 320, height: 180 }),
        } as unknown as HTMLCanvasElement;

        const size = measureCanvas(canvas, 2);

        expect(size.width).toBe(320);
        expect(size.height).toBe(180);
        expect(size.deviceWidth).toBe(640);
        expect(size.deviceHeight).toBe(360);
        expect(size.dpr).toBe(2);
    });

    it('rounds fractional device dimensions', () => {
        const canvas = {
            getBoundingClientRect: () => ({ width: 100.4, height: 50.7 }),
        } as unknown as HTMLCanvasElement;

        const size = measureCanvas(canvas, 2);

        expect(size.deviceWidth).toBe(201); // 100.4 * 2 = 200.8 -> 201
        expect(size.deviceHeight).toBe(101); // 50.7 * 2 = 101.4 -> 101
    });

    it('falls back to clientWidth/clientHeight if getBoundingClientRect is absent', () => {
        const canvas = {
            clientWidth: 250,
            clientHeight: 120,
        } as unknown as HTMLCanvasElement;

        const size = measureCanvas(canvas, 1);

        expect(size.width).toBe(250);
        expect(size.height).toBe(120);
        expect(size.deviceWidth).toBe(250);
        expect(size.deviceHeight).toBe(120);
    });
});

describe('applyCanvasSize', () => {
    it('updates backing store dimensions when changed', () => {
        const canvas = { width: 0, height: 0 } as HTMLCanvasElement;

        applyCanvasSize(canvas, {
            width: 100,
            height: 100,
            deviceWidth: 200,
            deviceHeight: 200,
            dpr: 2,
        });

        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(200);
    });

    it('does not re-assign backing store when dimensions are unchanged', () => {
        let widthSetCount = 0;
        let heightSetCount = 0;
        let backingWidth = 200;
        let backingHeight = 150;

        const canvas = {
            get width() {
                return backingWidth;
            },
            set width(v: number) {
                widthSetCount++;
                backingWidth = v;
            },
            get height() {
                return backingHeight;
            },
            set height(v: number) {
                heightSetCount++;
                backingHeight = v;
            },
        } as unknown as HTMLCanvasElement;

        applyCanvasSize(canvas, {
            width: 100,
            height: 75,
            deviceWidth: 200,
            deviceHeight: 150,
            dpr: 2,
        });

        expect(widthSetCount).toBe(0);
        expect(heightSetCount).toBe(0);
    });
});
