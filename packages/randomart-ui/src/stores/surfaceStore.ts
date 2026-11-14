import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import { globalPlaybackStore, usePlayback } from '@repo/surface/react/usePlayback';
import { create } from 'zustand';

export interface ClockProgress {
    readonly progress: number;
    play?(): void;
    pause?(): void;
    reset?(): void;
}

interface SurfaceState {
    /** Null until the canvas is mounted. */
    readonly clockStore: ClockProgress | null;
    readonly shaderError: ShaderError | null;
}

const INITIAL: SurfaceState = { clockStore: null, shaderError: null };

const store = create<SurfaceState>(() => INITIAL);

let unsubscribePlayback: (() => void) | null = null;
let unsubscribeReset: (() => void) | null = null;

export function useClockStore(): ClockProgress | null {
    return store((state) => state.clockStore);
}

export function useShaderError(): ShaderError | null {
    return store((state) => state.shaderError);
}

export function attachClock(clockStore: ClockProgress): void {
    store.setState({ clockStore });

    // Sync play/pause and reset with global playback store
    if (clockStore.play && clockStore.pause) {
        if (globalPlaybackStore.isPlaying) {
            clockStore.play();
        } else {
            clockStore.pause();
        }

        unsubscribePlayback?.();
        unsubscribePlayback = globalPlaybackStore.subscribe(() => {
            if (globalPlaybackStore.isPlaying) {
                clockStore.play?.();
            } else {
                clockStore.pause?.();
            }
        });

        unsubscribeReset?.();
        unsubscribeReset = globalPlaybackStore.onReset(() => {
            clockStore.reset?.();
        });
    }
}

export function setShaderError(shaderError: ShaderError | null): void {
    store.setState({ shaderError });
}

/** Called when the surface unmounts, so no handler can reach a disposed clock. */
export function detachSurface(): void {
    unsubscribePlayback?.();
    unsubscribePlayback = null;
    unsubscribeReset?.();
    unsubscribeReset = null;
    store.setState(INITIAL);
}

/** Connect directly to usePlayback. */
export function useIsPlaying(): boolean {
    return usePlayback().isPlaying;
}
