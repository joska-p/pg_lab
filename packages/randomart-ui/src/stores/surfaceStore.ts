import type { ShaderError } from '@repo/surface/gpu/ShaderError';
import { create } from 'zustand';

export interface SurfaceClock {
    readonly time: number;
}

interface SurfaceState {
    /** Null until the canvas is mounted. */
    readonly clockStore: SurfaceClock | null;
    readonly shaderError: ShaderError | null;
}

const INITIAL: SurfaceState = { clockStore: null, shaderError: null };

const store = create<SurfaceState>(() => INITIAL);

export function useClockStore(): SurfaceClock | null {
    return store((state) => state.clockStore);
}

export function useShaderError(): ShaderError | null {
    return store((state) => state.shaderError);
}

export function attachClock(clockStore: SurfaceClock): void {
    store.setState({ clockStore });
}

export function setShaderError(shaderError: ShaderError | null | undefined): void {
    store.setState({ shaderError: shaderError ?? null });
}

/** Called when the surface unmounts, so no handler can reach a disposed clock. */
export function detachSurface(): void {
    store.setState(INITIAL);
}
