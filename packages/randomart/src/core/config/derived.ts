import { createDurationSeconds } from '@repo/glaze/core/time';
import type { DurationSeconds } from '@repo/glaze/core/time';

import { CONFIG } from './config';

/** Default loop duration in seconds, derived from `CONFIG.artwork.loopMs`. */
export const DEFAULT_LOOP_DURATION: DurationSeconds = createDurationSeconds(
    CONFIG.artwork.loopMs / 1000,
);
