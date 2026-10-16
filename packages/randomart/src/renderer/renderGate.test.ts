import { describe, expect, it } from 'vite-plus/test';

import { createPhase } from './contract';
import { needsRender } from './renderGate';
import type { RenderKey } from './renderGate';

const base: RenderKey = {
    phase: createPhase(0.25),
    // CanvasDimension/DevicePixelRatio brands are structural: a plain literal matching the brand
    // constraint is valid for test fixtures (same trick glaze uses in its own tests).
    width: 640 as RenderKey['width'],
    height: 480 as RenderKey['height'],
    dpr: 2 as RenderKey['dpr'],
    animated: true,
};

describe('needsRender', () => {
    it('renders when nothing has been drawn yet', () => {
        expect(needsRender(null, base)).toBe(true);
    });

    it('skips an identical frame (paused animation, still image)', () => {
        expect(needsRender(base, { ...base })).toBe(false);
    });

    it('renders when the phase moves on an animated shader', () => {
        expect(needsRender(base, { ...base, phase: createPhase(0.26) })).toBe(true);
    });

    it('ignores the phase on a static shader', () => {
        const still = { ...base, animated: false };

        expect(needsRender(still, { ...still, phase: createPhase(0.9) })).toBe(false);
    });

    it('renders after any size change, even on a static shader', () => {
        const still = { ...base, animated: false };

        expect(needsRender(still, { ...still, width: 641 as RenderKey['width'] })).toBe(true);
        expect(needsRender(still, { ...still, height: 481 as RenderKey['height'] })).toBe(true);
        expect(needsRender(still, { ...still, dpr: 1 as RenderKey['dpr'] })).toBe(true);
    });
});
