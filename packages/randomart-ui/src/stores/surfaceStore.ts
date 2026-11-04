import type { ShaderError } from '@repo/glaze/gpu/shader/ShaderError';
import type { ClockStore } from '@repo/glaze/react/types';
import { useCallback, useSyncExternalStore } from 'react';
import { create } from 'zustand';

interface SurfaceState {
    /** Null until the canvas is mounted: there is no dead placeholder clock to compare against. */
    readonly clockStore: ClockStore | null;
    readonly shaderError: ShaderError | null;
}

const INITIAL: SurfaceState = { clockStore: null, shaderError: null };

const store = create<SurfaceState>(() => INITIAL);

export function useClockStore(): ClockStore | null {
    return store((state) => state.clockStore);
}

export function useShaderError(): ShaderError | null {
    return store((state) => state.shaderError);
}

export function attachClock(clockStore: ClockStore): void {
    store.setState({ clockStore });
}

export function setShaderError(shaderError: ShaderError | null): void {
    store.setState({ shaderError });
}

/** Called when the surface unmounts, so no handler can reach a disposed clock. */
export function detachSurface(): void {
    store.setState(INITIAL);
}

/** Subscribe to the clock without resubscribing on every render. */
export function useIsPlaying(): boolean {
    const clockStore = useClockStore();
    const subscribe = useCallback(
        (onStoreChange: () => void) => clockStore?.subscribe(onStoreChange) ?? (() => undefined),
        [clockStore],
    );
    const getSnapshot = useCallback(() => clockStore?.getIsPlaying() ?? false, [clockStore]);

    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
