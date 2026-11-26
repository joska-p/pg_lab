import type { ShaderError } from '@repo/surface/gpu/ShaderError';
import { globalPlaybackStore } from '@repo/surface/react/usePlayback';
import { create } from 'zustand';

export interface SurfaceClock {
    readonly time: number;
    play?(): void;
    pause?(): void;
    reset?(): void;
}

interface SurfaceState {
    /** Null until the canvas is mounted. */
    readonly clockStore: SurfaceClock | null;
    readonly shaderError: ShaderError | null;
}

const INITIAL: SurfaceState = { clockStore: null, shaderError: null };

const store = create<SurfaceState>(() => INITIAL);

let unsubscribePlayback: (() => void) | null = null;
let unsubscribeReset: (() => void) | null = null;

export function useClockStore(): SurfaceClock | null {
    return store((state) => state.clockStore);
}

export function useShaderError(): ShaderError | null {
    return store((state) => state.shaderError);
}

export function attachClock(clockStore: SurfaceClock): void {
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

export function setShaderError(shaderError: ShaderError | null | undefined): void {
    store.setState({ shaderError: shaderError ?? null });
}

/** Called when the surface unmounts, so no handler can reach a disposed clock. */
export function detachSurface(): void {
    unsubscribePlayback?.();
    unsubscribePlayback = null;
    unsubscribeReset?.();
    unsubscribeReset = null;
    store.setState(INITIAL);
}
