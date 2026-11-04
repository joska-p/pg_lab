import type { DurationSeconds } from '@repo/glaze/core/time';
import { create } from 'zustand';

import { DEFAULT_LOOP_DURATION } from '../constants';

interface PlaybackState {
    readonly duration: DurationSeconds;
}

const store = create<PlaybackState>(() => ({
    duration: DEFAULT_LOOP_DURATION,
}));

export function useDuration(): DurationSeconds {
    return store((state) => state.duration);
}

/** State only: `Scene` owns the imperative push to the clock (see its effect). */
export function setDuration(duration: DurationSeconds): void {
    store.setState({ duration });
}
