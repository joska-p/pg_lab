import React, { createContext, useContext, useSyncExternalStore } from 'react';

type Notify = () => void;
type Unsubscribe = () => void;

/** Playback state and controls shared by canvases and UI controls within a scope. */
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

export function createPlaybackStore(initialIsPlaying = true): PlaybackStore {
    let isPlaying = initialIsPlaying;
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

// Module-level singleton — default playback scope when no PlaybackProvider is present.
const globalPlaybackStore = createPlaybackStore();

const PlaybackStoreContext = createContext<PlaybackStore | null>(null);

export interface PlaybackProviderProps {
    store: PlaybackStore;
    children: React.ReactNode;
}

/** Scopes playback state for descendant canvases and controls. */
export function PlaybackProvider({ store, children }: PlaybackProviderProps): React.ReactElement {
    return React.createElement(PlaybackStoreContext.Provider, { value: store }, children);
}

/** Returns the nearest scoped playback store, or the global default. */
export function usePlaybackStore(): PlaybackStore {
    return useContext(PlaybackStoreContext) ?? globalPlaybackStore;
}

/**
 * Returns playback controls and reactive state for the nearest PlaybackProvider, falling back to
 * the global default store.
 */
export function usePlayback(): {
    isPlaying: boolean;
    togglePlay: () => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
} {
    const store = usePlaybackStore();
    const isPlaying = useSyncExternalStore(
        store.subscribe.bind(store),
        store.getSnapshot.bind(store),
        store.getSnapshot.bind(store),
    );

    return {
        isPlaying,
        togglePlay: store.togglePlay.bind(store),
        play: store.play.bind(store),
        pause: store.pause.bind(store),
        reset: store.reset.bind(store),
    };
}

/** Direct access to the default store for compatibility and non-React callers. */
export { globalPlaybackStore };
