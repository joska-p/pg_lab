import { describe, expect, it, vi } from 'vite-plus/test';

import { Camera2D } from './Camera2D';

// ---------------------------------------------------------------------------
// Helpers

function cam(options?: ConstructorParameters<typeof Camera2D>[0]): Camera2D {
    return new Camera2D(options);
}

// ---------------------------------------------------------------------------

describe('Camera2D — initial state', () => {
    it('defaults to identity (x=0, y=0, zoom=1)', () => {
        const c = cam();
        expect(c.x).toBe(0);
        expect(c.y).toBe(0);
        expect(c.zoom).toBe(1);
    });

    it('respects constructor options', () => {
        const c = cam({ x: 10, y: -5, zoom: 2 });
        expect(c.x).toBe(10);
        expect(c.y).toBe(-5);
        expect(c.zoom).toBe(2);
    });

    it('clamps constructor zoom to [minZoom, maxZoom]', () => {
        const low = cam({ zoom: 0, minZoom: 0.5 });
        expect(low.zoom).toBe(0.5);

        const high = cam({ zoom: 999, maxZoom: 10 });
        expect(high.zoom).toBe(10);
    });

    it('exposes minZoom and maxZoom', () => {
        const c = cam({ minZoom: 0.1, maxZoom: 50 });
        expect(c.minZoom).toBe(0.1);
        expect(c.maxZoom).toBe(50);
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — coordinate transforms', () => {
    it('screenToWorld is the inverse of worldToScreen', () => {
        const c = cam({ x: 100, y: 50, zoom: 2 });
        const world = { x: 10, y: 20 };
        const screen = c.worldToScreen(world);
        const back = c.screenToWorld(screen);
        expect(back.x).toBeCloseTo(world.x);
        expect(back.y).toBeCloseTo(world.y);
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — panBy', () => {
    it('translates pan correctly', () => {
        const c = cam({ x: 10, y: 20 });
        c.panBy(5, -3);
        expect(c.x).toBe(15);
        expect(c.y).toBe(17);
    });

    it('notifies on every panBy (even by 0)', () => {
        const c = cam();
        const sub = vi.fn();
        c.subscribe(sub);
        c.panBy(0, 0);
        // panBy always mutates (no equality check), so subscriber is called
        expect(sub).toHaveBeenCalledTimes(1);
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — panTo', () => {
    it('sets pan to the given position', () => {
        const c = cam({ x: 5, y: 10 });
        c.panTo(100, 200);
        expect(c.x).toBe(100);
        expect(c.y).toBe(200);
    });

    it('does not notify when the value is unchanged', () => {
        const c = cam({ x: 5, y: 10 });
        const sub = vi.fn();
        c.subscribe(sub);
        c.panTo(5, 10);
        expect(sub).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — zoomBy', () => {
    it('multiplies the current zoom', () => {
        const c = cam({ zoom: 2 });
        c.zoomBy(3);
        expect(c.zoom).toBe(6);
    });

    it('clamps the resulting zoom', () => {
        const c = cam({ zoom: 1, maxZoom: 4 });
        c.zoomBy(10);
        expect(c.zoom).toBe(4);
    });

    it('does not notify when clamped to same value', () => {
        const c = cam({ zoom: 4, maxZoom: 4 });
        const sub = vi.fn();
        c.subscribe(sub);
        c.zoomBy(2); // would go to 8, clamped to 4 — no change
        expect(sub).not.toHaveBeenCalled();
    });

    it('keeps the focal point stable', () => {
        const c = cam({ x: 0, y: 0, zoom: 1 });
        const focal = { x: 200, y: 100 };
        const worldBefore = c.screenToWorld(focal);
        c.zoomBy(2, focal);
        const worldAfter = c.screenToWorld(focal);
        expect(worldAfter.x).toBeCloseTo(worldBefore.x);
        expect(worldAfter.y).toBeCloseTo(worldBefore.y);
    });

    it('focal point stability is preserved under repeated zooms', () => {
        const c = cam({ x: 50, y: -20, zoom: 1 });
        const focal = { x: 300, y: 150 };
        const worldBefore = c.screenToWorld(focal);

        c.zoomBy(1.5, focal);
        c.zoomBy(0.8, focal);
        c.zoomBy(2.0, focal);

        const worldAfter = c.screenToWorld(focal);
        expect(worldAfter.x).toBeCloseTo(worldBefore.x, 10);
        expect(worldAfter.y).toBeCloseTo(worldBefore.y, 10);
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — zoomTo', () => {
    it('sets zoom to an absolute value', () => {
        const c = cam({ zoom: 2 });
        c.zoomTo(5);
        expect(c.zoom).toBe(5);
    });

    it('clamps to [minZoom, maxZoom]', () => {
        const c = cam({ minZoom: 1, maxZoom: 10 });
        c.zoomTo(0.001);
        expect(c.zoom).toBe(1);
        c.zoomTo(999);
        expect(c.zoom).toBe(10);
    });

    it('keeps focal point stable', () => {
        const c = cam({ x: 0, y: 0, zoom: 1 });
        const focal = { x: 150, y: 75 };
        const worldBefore = c.screenToWorld(focal);
        c.zoomTo(4, focal);
        const worldAfter = c.screenToWorld(focal);
        expect(worldAfter.x).toBeCloseTo(worldBefore.x);
        expect(worldAfter.y).toBeCloseTo(worldBefore.y);
    });

    it('does not notify when zoom is unchanged', () => {
        const c = cam({ zoom: 2 });
        const sub = vi.fn();
        c.subscribe(sub);
        c.zoomTo(2);
        expect(sub).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — patch', () => {
    it('applies partial updates', () => {
        const c = cam({ x: 1, y: 2, zoom: 3 });
        c.patch({ y: 99 });
        expect(c.x).toBe(1);
        expect(c.y).toBe(99);
        expect(c.zoom).toBe(3);
    });

    it('clamps zoom in patch', () => {
        const c = cam({ maxZoom: 10 });
        c.patch({ zoom: 100 });
        expect(c.zoom).toBe(10);
    });

    it('does not notify when nothing changes', () => {
        const c = cam({ x: 1, y: 2, zoom: 3 });
        const sub = vi.fn();
        c.subscribe(sub);
        c.patch({ x: 1, y: 2, zoom: 3 });
        expect(sub).not.toHaveBeenCalled();
    });

    it('notifies only once even when multiple keys change', () => {
        const c = cam({ x: 0, y: 0, zoom: 1 });
        const sub = vi.fn();
        c.subscribe(sub);
        c.patch({ x: 10, y: 20, zoom: 2 });
        expect(sub).toHaveBeenCalledTimes(1);
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — reset', () => {
    it('resets to 0,0,1 by default', () => {
        const c = cam({ x: 100, y: 200, zoom: 5 });
        c.reset();
        expect(c.x).toBe(0);
        expect(c.y).toBe(0);
        expect(c.zoom).toBe(1);
    });

    it('resets to provided state', () => {
        const c = cam();
        c.panBy(50, 50);
        c.reset({ x: 10, y: 20, zoom: 2 });
        expect(c.x).toBe(10);
        expect(c.y).toBe(20);
        expect(c.zoom).toBe(2);
    });

    it('does not notify when already at the target state', () => {
        const c = cam({ x: 0, y: 0, zoom: 1 });
        const sub = vi.fn();
        c.subscribe(sub);
        c.reset();
        expect(sub).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — subscribe / getVersion', () => {
    it('version starts at 0', () => {
        expect(cam().getVersion()).toBe(0);
    });

    it('increments version on each mutation', () => {
        const c = cam();
        c.panBy(1, 0);
        expect(c.getVersion()).toBe(1);
        c.zoomBy(2);
        expect(c.getVersion()).toBe(2);
        c.reset({ zoom: 0.5 });
        expect(c.getVersion()).toBe(3);
    });

    it('does not increment version when nothing changes', () => {
        const c = cam({ x: 0, y: 0, zoom: 1 });
        c.panTo(0, 0); // no-op
        expect(c.getVersion()).toBe(0);
        c.zoomTo(1); // no-op
        expect(c.getVersion()).toBe(0);
        c.reset(); // no-op
        expect(c.getVersion()).toBe(0);
    });

    it('calls subscribers synchronously', () => {
        const c = cam();
        const log: number[] = [];
        c.subscribe(() => {
            log.push(c.zoom);
        });
        c.zoomBy(3);
        expect(log).toEqual([3]);
    });

    it('unsubscribe stops notifications', () => {
        const c = cam();
        const sub = vi.fn();
        const off = c.subscribe(sub);
        c.panBy(1, 0);
        expect(sub).toHaveBeenCalledTimes(1);
        off();
        c.panBy(1, 0);
        expect(sub).toHaveBeenCalledTimes(1); // still 1
    });

    it('multiple subscribers are all notified', () => {
        const c = cam();
        const a = vi.fn();
        const b = vi.fn();
        c.subscribe(a);
        c.subscribe(b);
        c.panBy(5, 0);
        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);
    });
});

// ---------------------------------------------------------------------------

describe('Camera2D — viewport', () => {
    it('getViewport returns null initially', () => {
        expect(cam().getViewport()).toBeNull();
    });

    it('aspect defaults to 1 without a viewport', () => {
        expect(cam().aspect).toBe(1);
    });

    it('setViewport / getViewport round-trip', () => {
        const c = cam();
        c.setViewport({ width: 800, height: 400 });
        expect(c.getViewport()).toEqual({ width: 800, height: 400 });
    });

    it('aspect reflects width / height', () => {
        const c = cam();
        c.setViewport({ width: 800, height: 400 });
        expect(c.aspect).toBeCloseTo(2);
    });

    it('aspect is 1 when height is 0', () => {
        const c = cam();
        c.setViewport({ width: 800, height: 0 });
        expect(c.aspect).toBe(1);
    });
});
