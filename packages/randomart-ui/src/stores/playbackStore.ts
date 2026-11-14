import { create } from 'zustand';

import { DEFAULT_LOOP_DURATION } from '../constants';

interface PlaybackState {
    readonly duration: number;
}

const store = create<PlaybackState>(() => ({
    duration: DEFAULT_LOOP_DURATION,
}));

export function useDuration(): number {
    return store((state) => state.duration);
}

export function setDuration(duration: number): void {
    store.setState({ duration });
}
