import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_LOOP_DURATION, MAX_LOOP_DURATION, MIN_LOOP_DURATION } from '../constants';
import { clampDuration } from './duration';

describe('clampDuration', () => {
    it('returns valid duration unchanged', () => {
        expect(clampDuration(10)).toBe(10);
        expect(clampDuration(45.5)).toBe(45.5);
    });

    it('clamps values below minimum to MIN_LOOP_DURATION', () => {
        expect(clampDuration(0)).toBe(MIN_LOOP_DURATION);
        expect(clampDuration(-5)).toBe(MIN_LOOP_DURATION);
        expect(clampDuration(MIN_LOOP_DURATION)).toBe(MIN_LOOP_DURATION);
    });

    it('clamps values above maximum to MAX_LOOP_DURATION', () => {
        expect(clampDuration(100)).toBe(MAX_LOOP_DURATION);
        expect(clampDuration(MAX_LOOP_DURATION)).toBe(MAX_LOOP_DURATION);
    });

    it('falls back to DEFAULT_LOOP_DURATION for non-finite values', () => {
        expect(clampDuration(Number.NaN)).toBe(DEFAULT_LOOP_DURATION);
        expect(clampDuration(Number.POSITIVE_INFINITY)).toBe(DEFAULT_LOOP_DURATION);
        expect(clampDuration(Number.NEGATIVE_INFINITY)).toBe(DEFAULT_LOOP_DURATION);
    });
});
