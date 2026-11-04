import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';

import { DEFAULT_LOOP_DURATION, MAX_LOOP_DURATION, MIN_LOOP_DURATION } from '../constants';

/**
 * The duration field already hands over a number, so there is no string to parse here. Non-finite
 * values fall back to the default instead of producing a clock with a NaN duration.
 */
export function clampDuration(value: number): DurationSeconds {
    if (!Number.isFinite(value)) {
        return DEFAULT_LOOP_DURATION;
    }

    return createDurationSeconds(Math.min(MAX_LOOP_DURATION, Math.max(MIN_LOOP_DURATION, value)));
}
