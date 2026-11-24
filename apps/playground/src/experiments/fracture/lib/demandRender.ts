import type { GpuSurface } from '@repo/surface/gpu/GpuSurface';
import { useCallback, useRef } from 'react';

export interface DemandSurface {
    readonly width: number;
    readonly height: number;
    onContextRestored?(callback: (surface?: unknown) => void): (() => void) | void;
}

export interface DemandCamera {
    getVersion(): number;
}

export interface DemandHandle {
    /** Pass to `GpuCanvas` `shouldRender`: renders only when inputs changed. */
    shouldRender: (surface: DemandSurface | GpuSurface) => boolean;
    /** Pass to `GpuCanvas` `onMount`: forces a render + arms context-restore. */
    handleMount: (surface: DemandSurface | GpuSurface) => void;
}

interface DemandSnapshot {
    version: number;
    params: object | null;
    w: number;
    h: number;
}

/**
 * Render-on-demand gate for static fractal content. The shaders never consume time, so skipping a
 * frame is visually neutral. Renders when: first frames after mount, camera-rig version bumped,
 * params store reference changed, canvas size changed, or the GL context was restored (framebuffer
 * is dead).
 */
export function useDemandRender(params: object, camera: DemandCamera): DemandHandle {
    const last = useRef<DemandSnapshot>({ version: -1, params: null, w: 0, h: 0 });
    const forced = useRef(true);

    const handleMount = useCallback((surface: DemandSurface | GpuSurface) => {
        forced.current = true;
        surface.onContextRestored?.(() => {
            forced.current = true;
        });
    }, []);

    const shouldRender = useCallback(
        (surface: DemandSurface | GpuSurface) => {
            const version = camera.getVersion();
            const w = surface.width;
            const h = surface.height;
            const prev = last.current;
            const dirty =
                forced.current ||
                version !== prev.version ||
                params !== prev.params ||
                w !== prev.w ||
                h !== prev.h;

            if (dirty) {
                last.current = { version, params, w, h };
                forced.current = false;
            }

            return dirty;
        },
        [params, camera],
    );

    return { shouldRender, handleMount };
}
