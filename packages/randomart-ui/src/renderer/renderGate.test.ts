import { describe, expect, it } from 'vite-plus/test';

import { createPhase, needsRender } from './renderGate';

describe('createPhase', () => {
    it('wraps progress into [0, 1)', () => {
        expect(createPhase(0)).toBe(0);
        expect(createPhase(0.25)).toBe(0.25);
        expect(createPhase(1)).toBe(0);
        expect(createPhase(1.5)).toBe(0.5);
        expect(createPhase(-0.25)).toBe(0.75);
    });

    it('returns 0 for non-finite input', () => {
        expect(createPhase(NaN)).toBe(0);
        expect(createPhase(Infinity)).toBe(0);
        expect(createPhase(-Infinity)).toBe(0);
    });
});

describe('needsRender', () => {
    const base = (overrides: Partial<Parameters<typeof needsRender>[1]> = {}) => ({
        phase: 0,
        width: 800,
        height: 600,
        dpr: 1,
        animated: true,
        ...overrides,
    });

    it('renders when there is no previous key', () => {
        expect(needsRender(null, base())).toBe(true);
    });

    it('does not render when nothing changed', () => {
        const key = base();
        expect(needsRender(key, key)).toBe(false);
    });

    it('renders when width changes', () => {
        expect(needsRender(base(), base({ width: 900 }))).toBe(true);
    });

    it('renders when phase changes and animated is true', () => {
        expect(needsRender(base({ phase: 0 }), base({ phase: 0.5 }))).toBe(true);
    });

    it('does not render when phase changes and animated is false', () => {
        expect(
            needsRender(base({ animated: false, phase: 0 }), base({ animated: false, phase: 0.5 })),
        ).toBe(false);
    });
});
