import { describe, expect, it } from 'vite-plus/test';

import { needsRender } from './renderGate';

describe('needsRender', () => {
    const base = (overrides: Partial<Parameters<typeof needsRender>[1]> = {}) => ({
        time: 0,
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

    it('renders when time changes and animated is true', () => {
        expect(needsRender(base({ time: 0 }), base({ time: 0.5 }))).toBe(true);
    });

    it('does not render when time changes and animated is false', () => {
        expect(
            needsRender(base({ animated: false, time: 0 }), base({ animated: false, time: 0.5 })),
        ).toBe(false);
    });

    it('renders when postProcess changes even when animated is false', () => {
        expect(
            needsRender(
                base({ animated: false, time: 0, postProcess: '' }),
                base({ animated: false, time: 0, postProcess: 'grain' }),
            ),
        ).toBe(true);
    });
});
