import { describe, expect, it } from 'vite-plus/test';

import { createPhase } from '../contract/contract';
import type { RenderKey } from '../types';
import { needsRender } from './renderGate';

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

    it('renders when the phase moves on a shader that reads u_phase', () => {
        expect(needsRender(base, { ...base, phase: createPhase(0.26) })).toBe(true);
    });

    it('ignores the phase on a shader that does not read u_phase', () => {
        const constOnly = { ...base, animated: false };

        expect(needsRender(constOnly, { ...constOnly, phase: createPhase(0.9) })).toBe(false);
    });

    it('renders after any size change, even on a const-only shader', () => {
        const constOnly = { ...base, animated: false };

        expect(needsRender(constOnly, { ...constOnly, width: 641 as RenderKey['width'] })).toBe(
            true,
        );
        expect(needsRender(constOnly, { ...constOnly, height: 481 as RenderKey['height'] })).toBe(
            true,
        );
        expect(needsRender(constOnly, { ...constOnly, dpr: 1 as RenderKey['dpr'] })).toBe(true);
    });
});
