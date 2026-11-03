import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';

import { MAX_LOOP_MS, MIN_LOOP_MS } from '../artwork/constants';
import { CONFIG } from './config';

/** Default loop duration in seconds, derived from `CONFIG.artwork.loopMs`. */
export const DEFAULT_LOOP_DURATION: DurationSeconds = createDurationSeconds(
    CONFIG.artwork.loopMs / 1000,
);

/** Accepted loop duration range in seconds, derived from the render contract bounds. */
export const MIN_LOOP_DURATION: DurationSeconds = createDurationSeconds(MIN_LOOP_MS / 1000);
export const MAX_LOOP_DURATION: DurationSeconds = createDurationSeconds(MAX_LOOP_MS / 1000);
