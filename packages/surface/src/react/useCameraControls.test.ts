import { describe, expect, it } from 'vite-plus/test';

import { buttonLabel, wheelFocalPoint, wheelZoomFactor } from './useCameraControls';

// ---------------------------------------------------------------------------

describe('buttonLabel', () => {
    it('maps button 0 to left', () => {
        expect(buttonLabel(0)).toBe('left');
    });

    it('maps button 1 to middle', () => {
        expect(buttonLabel(1)).toBe('middle');
    });

    it('maps button 2 to right', () => {
        expect(buttonLabel(2)).toBe('right');
    });

    it('returns null for unknown buttons', () => {
        expect(buttonLabel(3)).toBeNull();
        expect(buttonLabel(-1)).toBeNull();
        expect(buttonLabel(99)).toBeNull();
    });
});

// ---------------------------------------------------------------------------

describe('wheelZoomFactor', () => {
    it('returns > 1 for negative deltaY (scroll up = zoom in)', () => {
        expect(wheelZoomFactor(-100)).toBeGreaterThan(1);
    });

    it('returns < 1 for positive deltaY (scroll down = zoom out)', () => {
        expect(wheelZoomFactor(100)).toBeLessThan(1);
    });

    it('returns 1 for deltaY = 0', () => {
        expect(wheelZoomFactor(0)).toBe(1);
    });

    it('zoom-in and zoom-out are reciprocal for the same magnitude', () => {
        const inFactor = wheelZoomFactor(-100, 1.15);
        const outFactor = wheelZoomFactor(100, 1.15);
        expect(inFactor * outFactor).toBeCloseTo(1, 10);
    });

    it('respects the speed parameter', () => {
        const slow = wheelZoomFactor(-100, 1.05);
        const fast = wheelZoomFactor(-100, 1.5);
        expect(fast).toBeGreaterThan(slow);
    });

    it('applies speed as a continuous function of deltaY', () => {
        // Two half-deltas should compose to the same result as one full delta.
        const full = wheelZoomFactor(-200, 1.15);
        const half = wheelZoomFactor(-100, 1.15);
        expect(half * half).toBeCloseTo(full, 10);
    });
});

// ---------------------------------------------------------------------------

describe('wheelFocalPoint', () => {
    it('computes canvas-local coordinates by subtracting rect origin', () => {
        const rect = { left: 50, top: 100 } as DOMRect;
        const focal = wheelFocalPoint(150, 200, rect);
        expect(focal.x).toBe(100);
        expect(focal.y).toBe(100);
    });

    it('returns (0, 0) when clientX/Y equal the rect origin', () => {
        const rect = { left: 20, top: 30 } as DOMRect;
        const focal = wheelFocalPoint(20, 30, rect);
        expect(focal.x).toBe(0);
        expect(focal.y).toBe(0);
    });

    it('handles negative offsets (canvas scrolled out of view)', () => {
        const rect = { left: 200, top: 150 } as DOMRect;
        const focal = wheelFocalPoint(100, 80, rect);
        expect(focal.x).toBe(-100);
        expect(focal.y).toBe(-70);
    });
});
