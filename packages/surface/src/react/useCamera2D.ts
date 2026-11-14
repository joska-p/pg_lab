import { useSyncExternalStore } from 'react';

import type { Camera2D } from '../core/Camera2D';

/**
 * Subscribes to a `Camera2D` instance and returns its current version number.
 *
 * Re-renders only when the camera state actually changes (i.e. the version increments). Use the
 * version as a render-trigger; read the actual values directly from the camera instance.
 *
 * ```tsx
 * const version = useCamera2D(camera);
 * // version changes → component re-renders → read camera.x / camera.y / camera.zoom
 * ```
 */
export function useCamera2D(camera: Camera2D): number {
    return useSyncExternalStore(
        (notify) => camera.subscribe(notify),
        () => camera.getVersion(),
    );
}
