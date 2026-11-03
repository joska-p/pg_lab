import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_LOOP_DURATION } from '../config/derived';
import { DEFAULT_CONTEXT_OPTIONS } from './constants';
import { createPhase } from './phase';

describe('renderer / phase & context options', () => {
    describe('createPhase', () => {
        it('maps progress values strictly into [0, 1)', () => {
            expect(createPhase(0)).toBe(0);
            expect(createPhase(0.25)).toBe(0.25);
            expect(createPhase(0.5)).toBe(0.5);
            expect(createPhase(0.75)).toBe(0.75);
            // 1.0 wraps back to 0 (Clock.progress is [0, 1] inclusive)
            expect(createPhase(1)).toBe(0);
            // Values beyond 1 wrap properly
            expect(createPhase(1.25)).toBeCloseTo(0.25);
            expect(createPhase(2.0)).toBe(0);
        });

        it('handles negative progress values gracefully', () => {
            expect(createPhase(-0.25)).toBeCloseTo(0.75);
            expect(createPhase(-1)).toBe(0);
        });

        it('never returns >= 1 even with edge cases', () => {
            expect(createPhase(0.9999999999999999)).toBeLessThan(1);
            expect(createPhase(0.9999999999999999)).toBeGreaterThanOrEqual(0);
        });

        it('rejects a non-finite progress: fail loudly, do not propagate a NaN', () => {
            expect(() => createPhase(Number.NaN)).toThrow(
                'Randomart: clock progress must be a finite number, received NaN',
            );
        });
    });

    describe('defaults', () => {
        it('has an 60-second default duration', () => {
            expect(DEFAULT_LOOP_DURATION).toBe(60);
        });

        it('configures antialias false and preserveDrawingBuffer true', () => {
            expect(DEFAULT_CONTEXT_OPTIONS.antialias).toBe(false);
            expect(DEFAULT_CONTEXT_OPTIONS.preserveDrawingBuffer).toBe(true);
        });
    });
});
