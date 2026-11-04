import { createDurationSeconds } from '@repo/glaze/core/time';

export const DEFAULT_LOOP_DURATION = createDurationSeconds(60);
export const MIN_LOOP_DURATION = 0.5;
export const MAX_LOOP_DURATION = 90;
