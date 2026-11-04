import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';

import { DEFAULT_LOOP_DURATION, MAX_LOOP_DURATION, MIN_LOOP_DURATION } from '../constants';

/** Clamp the loop duration to the supported range; non-finite values fall back to the default. */
export function clampDuration(value: number): DurationSeconds {
    if (!Number.isFinite(value)) {
        return DEFAULT_LOOP_DURATION;
    }

    return createDurationSeconds(Math.min(MAX_LOOP_DURATION, Math.max(MIN_LOOP_DURATION, value)));
}
