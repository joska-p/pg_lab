import { useSyncExternalStore } from 'react';

type Notify = () => void;
type Unsubscribe = () => void;

/** Global playback state — one channel per page, shared by all SurfaceCanvas instances. */
export interface PlaybackStore {
    isPlaying: boolean;
    togglePlay(): void;
    play(): void;
    pause(): void;
    reset(): void;
    subscribe(fn: Notify): Unsubscribe;
    onReset(fn: Notify): Unsubscribe;
    getSnapshot(): boolean;
}

export function createPlaybackStore(): PlaybackStore {
    let isPlaying = true;
    const listeners = new Set<Notify>();
    const resetListeners = new Set<Notify>();

    function notify(): void {
        for (const fn of listeners) {
            fn();
        }
    }

    function notifyReset(): void {
        for (const fn of resetListeners) {
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
        reset() {
            notifyReset();
            notify();
        },
        subscribe(fn: Notify): Unsubscribe {
            listeners.add(fn);
            return () => {
                listeners.delete(fn);
            };
        },
        onReset(fn: Notify): Unsubscribe {
            resetListeners.add(fn);
            return () => {
                resetListeners.delete(fn);
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
    reset: () => void;
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
        reset: globalPlaybackStore.reset.bind(globalPlaybackStore),
    };
}

/** Direct access to the store (for SurfaceCanvas to sync the clock). */
export { globalPlaybackStore };
