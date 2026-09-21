import type { DurationSeconds, TimeSpeed } from './time';

export interface ClockRuntimeOptions {
    /** Multiplier applied to every delta; defaults to 1. */
    speed?: TimeSpeed;
    /** Whether the clock starts playing immediately; defaults to true. */
    autoStart?: boolean;
}

export type FreeClockOptions = ClockRuntimeOptions & { mode?: 'free' };

export type TimedClockOptions = ClockRuntimeOptions & {
    mode: 'timed';
    duration: DurationSeconds;
    /** Wraps back to the start after reaching the end; defaults to true. */
    loop?: boolean;
    /** Reflects at both ends instead of wrapping; takes precedence over `loop`. */
    pingPong?: boolean;
};

/** A clock is either free-running or timed — there is no duration-less ping-pong to ignore. */
export type ClockOptions = FreeClockOptions | TimedClockOptions;

/** Resolved config mirroring the options union, so `update()` dispatches on the same shape. */
export type ClockState =
    | { kind: 'free' }
    | { kind: 'timed'; duration: DurationSeconds; loop: boolean; pingPong: boolean };
