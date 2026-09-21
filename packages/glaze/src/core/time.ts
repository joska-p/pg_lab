import { assertFinite, assertStrictlyPositive, type Brand } from './brands';

export type DurationSeconds = Brand<number, 'DurationSeconds'>;
export type TimeSpeed = Brand<number, 'TimeSpeed'>;
export type Seconds = Brand<number, 'Seconds'>;

/**
 * Refinement of `Seconds` (assignable wherever `Seconds` is expected) rather than a sibling
 * `Brand`: stacking two brands on the same `__brand` key would intersect to `never`.
 */
export type NonNegativeSeconds = Seconds & { readonly __nonNegative: true };
export type Milliseconds = Brand<number, 'Milliseconds'>;

const MS_PER_SECOND = 1000;

export function createDurationSeconds(value: number): DurationSeconds {
    assertStrictlyPositive(value, 'duration');

    return value as DurationSeconds;
}

export function createTimeSpeed(value: number): TimeSpeed {
    assertStrictlyPositive(value, 'time speed');

    return value as TimeSpeed;
}

export function createSeconds(value: number): Seconds {
    assertFinite(value, 'seconds');

    return value as Seconds;
}

export function createNonNegativeSeconds(value: number): NonNegativeSeconds {
    assertFinite(value, 'seconds');

    if (value < 0) {
        throw new Error(`Glaze: seconds must not be negative, received ${String(value)}`);
    }

    return value as NonNegativeSeconds;
}

export function createMilliseconds(value: number): Milliseconds {
    assertFinite(value, 'milliseconds');

    return value as Milliseconds;
}

export function msToSeconds(value: number): Seconds {
    return createSeconds(value / MS_PER_SECOND);
}

export function secondsToMs(value: number): Milliseconds {
    return createMilliseconds(value * MS_PER_SECOND);
}
