import { describe, expect, it, vi } from 'vite-plus/test';

import { createClockStore } from '../react/clockStore';
import { createClock } from './Clock';
import { createDurationSeconds, createNonNegativeSeconds } from './time';

function timedClock(seconds: number, extra: { pingPong?: boolean } = {}) {
    return createClock({
        mode: 'timed',
        duration: createDurationSeconds(seconds),
        ...extra,
    });
}

describe('Clock.setDuration', () => {
    it('keeps the progress when the duration changes (no visual jump)', () => {
        const clock = timedClock(8);

        clock.update(createNonNegativeSeconds(2));
        expect(clock.progress).toBeCloseTo(0.25);

        clock.setDuration(createDurationSeconds(4));

        expect(clock.duration).toBe(4);
        expect(clock.progress).toBeCloseTo(0.25);
        expect(clock.time).toBeCloseTo(1);
    });

    it('keeps looping with the new duration', () => {
        const clock = timedClock(8);

        clock.update(createNonNegativeSeconds(4));
        clock.setDuration(createDurationSeconds(2));
        clock.update(createNonNegativeSeconds(1.5));

        // progress was 0.5 → time 1, +1.5 = 2.5 → wraps to 0.5 on a 2s loop.
        expect(clock.time).toBeCloseTo(0.5);
    });

    it('keeps the ping-pong direction (time scaled, not reset)', () => {
        const clock = timedClock(4, { pingPong: true });

        clock.update(createNonNegativeSeconds(3));
        clock.setDuration(createDurationSeconds(8));

        expect(clock.progress).toBeCloseTo(0.75);
    });

    it('rejects a free-running clock, which has no duration', () => {
        expect(() => createClock().setDuration(createDurationSeconds(1))).toThrow(/timed/);
    });
});

describe('ClockStore.setDuration', () => {
    it('forwards to the clock and notifies subscribers', () => {
        const store = createClockStore(timedClock(8));
        const listener = vi.fn();

        store.subscribe(listener);
        store.setDuration(createDurationSeconds(2));

        expect(store.duration).toBe(2);
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
