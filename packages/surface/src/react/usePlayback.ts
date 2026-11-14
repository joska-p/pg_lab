import { useSyncExternalStore } from 'react';

type Notify = () => void;
type Unsubscribe = () => void;

/** Global playback state — one channel per page, shared by all SurfaceCanvas instances. */
interface PlaybackStore {
    isPlaying: boolean;
    togglePlay(): void;
    play(): void;
    pause(): void;
    subscribe(fn: Notify): Unsubscribe;
    getSnapshot(): boolean;
}

function createPlaybackStore(): PlaybackStore {
    let isPlaying = true;
    const listeners = new Set<Notify>();

    function notify(): void {
        for (const fn of listeners) {
            fn();
        }
    }

    return {
        get isPlaying() {
            return isPlaying;
        },
        togglePlay() {
            isPlaying = !isPlaying;
            notify();
        },
        play() {
            if (isPlaying) {
                return;
            }
            isPlaying = true;
            notify();
        },
        pause() {
            if (!isPlaying) {
                return;
            }
            isPlaying = false;
            notify();
        },
        subscribe(fn: Notify): Unsubscribe {
            listeners.add(fn);
            return () => {
                listeners.delete(fn);
            };
        },
        getSnapshot(): boolean {
            return isPlaying;
        },
    };
}

// Module-level singleton — one clock canal per page, like glaze's useClockStore.
const globalPlaybackStore = createPlaybackStore();

/**
 * Returns the global playback controls and reactive state. All SurfaceCanvas instances share the
 * same play/pause state.
 */
export function usePlayback(): {
    isPlaying: boolean;
    togglePlay: () => void;
    play: () => void;
    pause: () => void;
} {
    const isPlaying = useSyncExternalStore(
        globalPlaybackStore.subscribe.bind(globalPlaybackStore),
        globalPlaybackStore.getSnapshot.bind(globalPlaybackStore),
    );

    return {
        isPlaying,
        togglePlay: globalPlaybackStore.togglePlay.bind(globalPlaybackStore),
        play: globalPlaybackStore.play.bind(globalPlaybackStore),
        pause: globalPlaybackStore.pause.bind(globalPlaybackStore),
    };
}

/** Direct access to the store (for SurfaceCanvas to sync the clock). */
export { globalPlaybackStore };
