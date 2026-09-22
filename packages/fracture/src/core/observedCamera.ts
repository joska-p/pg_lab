import { createCamera, type Camera } from '@repo/glaze/core/Camera';
import { createCameraControls } from '@repo/glaze/core/CameraControls';
import {
    createZoomFactor,
    DEFAULT_ZOOM_BOUNDS,
    type CameraControls,
} from '@repo/glaze/core/cameraTypes';

/**
 * Camera rig owned by one experiment module (D4): the glaze `Camera` stays the single source of
 * truth, and the rig owns the change signal around it. All mutations flow through the wrapped
 * `CameraControls` (the only writer glaze gestures use), which bumps a version cookie consumed via
 * `useSyncExternalStore`. The viewport size is tracked alongside so complex-plane mapping stays
 * aspect-correct without reaching for the live `GpuSurface`.
 */
export interface CameraRig {
    readonly camera: Camera;
    readonly controls: CameraControls;
    readonly minZoom: number;
    readonly maxZoom: number;
    subscribe(fn: () => void): () => void;
    getVersion(): number;
    setViewport(width: number, height: number): void;
    getViewport(): { width: number; height: number };
}

export function createCameraRig(options?: { minZoom?: number; maxZoom?: number }): CameraRig {
    const minZoom = options?.minZoom ?? DEFAULT_ZOOM_BOUNDS.minZoom;
    const maxZoom = options?.maxZoom ?? DEFAULT_ZOOM_BOUNDS.maxZoom;
    const camera = createCamera(0, 0, createZoomFactor(1));
    const inner = createCameraControls(camera, minZoom, maxZoom);

    let version = 0;
    const listeners = new Set<() => void>();
    const viewport = { width: 1, height: 1 };

    function notify(): void {
        version += 1;
        listeners.forEach((fn) => {
            fn();
        });
    }

    function changed(before: { x: number; y: number; zoom: number }): boolean {
        return before.x !== camera.x || before.y !== camera.y || before.zoom !== camera.zoom;
    }

    function commit(run: () => void): void {
        const before = { x: camera.x, y: camera.y, zoom: camera.zoom };

        run();

        if (changed(before)) {
            notify();
        }
    }

    const controls: CameraControls = {
        panTo: (position) => commit(() => inner.panTo(position)),
        panBy: (dx, dy) => commit(() => inner.panBy(dx, dy)),
        zoomTo: (zoom, focalPoint) => commit(() => inner.zoomTo(zoom, focalPoint)),
        zoomAt: (focalPoint, zoom) => commit(() => inner.zoomAt(focalPoint, zoom)),
        zoomBy: (factor, focalPoint) => commit(() => inner.zoomBy(factor, focalPoint)),
        reset: () => commit(() => inner.reset()),
        patch: (partial) => commit(() => inner.patch(partial)),
    };

    return {
        camera,
        controls,
        minZoom,
        maxZoom,
        subscribe(fn: () => void): () => void {
            listeners.add(fn);

            return () => {
                listeners.delete(fn);
            };
        },
        getVersion(): number {
            return version;
        },
        setViewport(width: number, height: number): void {
            if (viewport.width !== width || viewport.height !== height) {
                viewport.width = width;
                viewport.height = height;
                notify();
            }
        },
        getViewport(): { width: number; height: number } {
            return { ...viewport };
        },
    };
}
