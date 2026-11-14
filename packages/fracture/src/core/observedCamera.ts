import { createPositiveNumber } from '@repo/glaze/core/brands';
import { createCamera } from '@repo/glaze/core/Camera';
import type { Camera } from '@repo/glaze/core/Camera';
import { DEFAULT_ZOOM_BOUNDS } from '@repo/glaze/core/cameraTypes';
import type { CameraControls } from '@repo/glaze/core/cameraTypes';
import { Camera2D } from '@repo/surface/core/Camera2D';
import type { Point2D } from '@repo/surface/core/Camera2D';

/**
 * Camera rig owned by one experiment module (D4).
 *
 * Extends `Camera2D` from `@repo/surface` so modern modules interact with a genuine reactive
 * camera, while maintaining backward-compatibility wrappers (`camera` and `controls`) for scenes
 * that still use `@repo/glaze`'s `GpuCanvas`.
 */
export class CameraRig extends Camera2D {
    readonly camera: Camera;
    readonly controls: CameraControls;

    constructor(options?: { minZoom?: number; maxZoom?: number }) {
        const minZoom = options?.minZoom ?? DEFAULT_ZOOM_BOUNDS.minZoom;
        const maxZoom = options?.maxZoom ?? DEFAULT_ZOOM_BOUNDS.maxZoom;
        super({ minZoom, maxZoom });

        const glazeCamera = createCamera(this.x, this.y, createPositiveNumber(this.zoom));
        this.camera = glazeCamera;

        this.subscribe(() => {
            glazeCamera.x = this.x;
            glazeCamera.y = this.y;
            glazeCamera.zoom = createPositiveNumber(this.zoom);
        });

        this.controls = {
            panTo: (position: Point2D) => this.panTo(position.x, position.y),
            panBy: (dx: number, dy: number) => this.panBy(dx, dy),
            zoomTo: (zoom: number, focalPoint?: Point2D) => this.zoomTo(zoom, focalPoint),
            zoomAt: (focalPoint: Point2D, zoom: number) => this.zoomTo(zoom, focalPoint),
            zoomBy: (factor: number, focalPoint?: Point2D) => this.zoomBy(factor, focalPoint),
            reset: () => this.reset(),
            patch: (partial) => this.patch(partial),
        };
    }

    override setViewport(
        viewportOrWidth: { width: number; height: number } | number,
        maybeHeight?: number,
    ): void {
        if (typeof viewportOrWidth === 'number') {
            super.setViewport({ width: viewportOrWidth, height: maybeHeight ?? 1 });
        } else {
            super.setViewport(viewportOrWidth);
        }
    }

    override getViewport(): { width: number; height: number } {
        return super.getViewport() ?? { width: 1, height: 1 };
    }
}

export function createCameraRig(options?: { minZoom?: number; maxZoom?: number }): CameraRig {
    return new CameraRig(options);
}
