import { describe, expect, it } from 'vite-plus/test';

import { Clock } from './Clock';

describe('Clock', () => {
    it('initializes in playing state with zero time and deltaTime', () => {
        const clock = new Clock();
        expect(clock.isPlaying).toBe(true);
        expect(clock.time).toBe(0);
        expect(clock.deltaTime).toBe(0);
    });

    it('accumulates time when playing', () => {
        const clock = new Clock();
        clock.update(0.016);
        expect(clock.time).toBeCloseTo(0.016);
        expect(clock.deltaTime).toBeCloseTo(0.016);

        clock.update(0.033);
        expect(clock.time).toBeCloseTo(0.049);
        expect(clock.deltaTime).toBeCloseTo(0.033);
    });

    it('freezes time and zeroes deltaTime when paused', () => {
        const clock = new Clock();
        clock.update(0.1);
        expect(clock.time).toBeCloseTo(0.1);

        clock.pause();
        expect(clock.isPlaying).toBe(false);
        expect(clock.deltaTime).toBe(0);

        clock.update(0.05);
        expect(clock.time).toBeCloseTo(0.1);
        expect(clock.deltaTime).toBe(0);
    });

    it('resumes updating when unpaused', () => {
        const clock = new Clock();
        clock.update(0.1);
        clock.pause();
        clock.update(0.5);
        clock.play();
        expect(clock.isPlaying).toBe(true);

        clock.update(0.02);
        expect(clock.time).toBeCloseTo(0.12);
        expect(clock.deltaTime).toBeCloseTo(0.02);
    });

    it('toggles playing state', () => {
        const clock = new Clock();
        expect(clock.isPlaying).toBe(true);

        clock.togglePlay();
        expect(clock.isPlaying).toBe(false);

        clock.togglePlay();
        expect(clock.isPlaying).toBe(true);
    });

    it('resets time and deltaTime to zero', () => {
        const clock = new Clock();
        clock.update(1.5);
        expect(clock.time).toBeCloseTo(1.5);

        clock.reset();
        expect(clock.time).toBe(0);
        expect(clock.deltaTime).toBe(0);
    });
});
