import type { GpuSurface } from '@repo/glaze/gpu/types';
import { useCallback, useRef } from 'react';

import type { CameraRig } from '../core/observedCamera';

export interface DemandHandle {
    /** Pass to GpuCanvas `shouldRender`: renders only when inputs changed. */
    shouldRender: (surface: GpuSurface) => boolean;
    /** Pass to GpuCanvas `onMount` (or combine): forces a render + arms context-restore. */
    handleMount: (surface: GpuSurface) => void;
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
export function useDemandRender(params: object, cameraRig: CameraRig): DemandHandle {
    const last = useRef<DemandSnapshot>({ version: -1, params: null, w: 0, h: 0 });
    const forced = useRef(true);

    const handleMount = useCallback((surface: GpuSurface) => {
        forced.current = true;
        surface.canvas.addEventListener('webglcontextrestored', () => {
            forced.current = true;
        });
    }, []);

    const shouldRender = useCallback(
        (surface: GpuSurface) => {
            const version = cameraRig.getVersion();
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
        [params, cameraRig],
    );

    return { shouldRender, handleMount };
}
