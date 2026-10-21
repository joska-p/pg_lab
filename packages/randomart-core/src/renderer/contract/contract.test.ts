import { describe, expect, it } from 'vite-plus/test';

import {
    createPhase,
    DEFAULT_CONTEXT_OPTIONS,
    DEFAULT_LOOP_DURATION,
    HANDWRITTEN_TEST_SHADER,
} from './contract';

describe('renderer / contract & helpers', () => {
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

    describe('handwritten test shader', () => {
        it('references v_p.x, v_p.y, and u_phase', () => {
            expect(HANDWRITTEN_TEST_SHADER).toContain('v_p.x');
            expect(HANDWRITTEN_TEST_SHADER).toContain('v_p.y');
            expect(HANDWRITTEN_TEST_SHADER).toContain('u_phase');
        });

        it('has precision highp float', () => {
            expect(HANDWRITTEN_TEST_SHADER).toContain('precision highp float;');
        });
    });

    describe('defaults', () => {
        it('has an 60-seconds default duration', () => {
            expect(DEFAULT_LOOP_DURATION).toBe(60);
        });

        it('configures antialias false and preserveDrawingBuffer true', () => {
            expect(DEFAULT_CONTEXT_OPTIONS.antialias).toBe(false);
            expect(DEFAULT_CONTEXT_OPTIONS.preserveDrawingBuffer).toBe(true);
        });
    });
});
