import { describe, expect, it } from 'vite-plus/test';

import { needsRender } from './renderGate';
import type { RenderKey } from './renderGate';

const base: RenderKey = { phase: 0.25, width: 640, height: 480, dpr: 2, animated: true };

describe('needsRender', () => {
    it('renders when nothing has been drawn yet', () => {
        expect(needsRender(null, base)).toBe(true);
    });

    it('skips an identical frame (paused animation, still image)', () => {
        expect(needsRender(base, { ...base })).toBe(false);
    });

    it('renders when the phase moves on an animated shader', () => {
        expect(needsRender(base, { ...base, phase: 0.26 })).toBe(true);
    });

    it('ignores the phase on a static shader', () => {
        const still = { ...base, animated: false };

        expect(needsRender(still, { ...still, phase: 0.9 })).toBe(false);
    });

    it('renders after any size change, even on a static shader', () => {
        const still = { ...base, animated: false };

        expect(needsRender(still, { ...still, width: 641 })).toBe(true);
        expect(needsRender(still, { ...still, height: 481 })).toBe(true);
        expect(needsRender(still, { ...still, dpr: 1 })).toBe(true);
    });
});
