import { copyCamera, createCamera, type Camera } from './Camera';
import {
    DEFAULT_ZOOM_BOUNDS,
    createZoomClamp,
    type CameraControls,
    type CameraPatch,
    type ZoomClamp,
} from './cameraTypes';
import {
    toScreenDelta,
    toScreenPoint,
    type Point2D,
    type ScreenDelta,
    type ScreenPoint,
} from './geometry';

/** Moves the camera translation so the world origin lands on `position`. */
export function panTo(camera: Camera, position: ScreenPoint): Camera {
    return createCamera(position.x, position.y, camera.zoom);
}

/** Translates the camera by a screen-space delta. */
export function panBy(camera: Camera, delta: ScreenDelta): Camera {
    return createCamera(camera.x + delta.x, camera.y + delta.y, camera.zoom);
}

/**
 * Sets the absolute zoom while keeping the world point under `focalPoint` pinned to the same screen
 * location — the anchor every zoom interaction reduces to.
 */
export function zoomAt(
    camera: Camera,
    focalPoint: ScreenPoint,
    zoom: number,
    clampZoom: ZoomClamp,
): Camera {
    const nextZoom = clampZoom(zoom);
    const world = camera.screenToWorld(focalPoint);

    return createCamera(
        focalPoint.x - world.x * nextZoom,
        focalPoint.y - world.y * nextZoom,
        nextZoom,
    );
}

/** Absolute zoom, optionally anchored to a focal point; the zoom is clamped either way. */
export function zoomTo(
    camera: Camera,
    zoom: number,
    clampZoom: ZoomClamp,
    focalPoint?: ScreenPoint,
): Camera {
    return focalPoint === undefined
        ? createCamera(camera.x, camera.y, clampZoom(zoom))
        : zoomAt(camera, focalPoint, zoom, clampZoom);
}

/** Relative zoom around a focal point; the resulting zoom is clamped, not the factor. */
export function zoomBy(
    camera: Camera,
    factor: number,
    focalPoint: ScreenPoint,
    clampZoom: ZoomClamp,
): Camera {
    return zoomAt(camera, focalPoint, camera.zoom * factor, clampZoom);
}

/**
 * Applies a partial update as a fresh camera: omitted fields carry over, `zoom` runs through the
 * clamp, `x`/`y` must be finite — a NaN patch throws instead of poisoning the camera.
 */
export function patchCamera(camera: Camera, patch: CameraPatch, clampZoom: ZoomClamp): Camera {
    const zoom = patch.zoom === undefined ? camera.zoom : clampZoom(patch.zoom);

    return createCamera(patch.x ?? camera.x, patch.y ?? camera.y, zoom);
}

export function createCameraControls(
    camera: Camera,
    minZoom: number = DEFAULT_ZOOM_BOUNDS.minZoom,
    maxZoom: number = DEFAULT_ZOOM_BOUNDS.maxZoom,
    initial: Camera = copyCamera(camera),
): CameraControls {
    const clampZoom = createZoomClamp(minZoom, maxZoom);

    const commit = (next: Camera): void => {
        camera.x = next.x;
        camera.y = next.y;
        camera.zoom = next.zoom;
    };

    return {
        panTo(position: Point2D): void {
            commit(panTo(camera, toScreenPoint(position)));
        },

        panBy(dx: number, dy: number): void {
            commit(panBy(camera, toScreenDelta({ x: dx, y: dy })));
        },

        zoomAt(focalPoint: Point2D, zoom: number): void {
            commit(zoomAt(camera, toScreenPoint(focalPoint), zoom, clampZoom));
        },

        zoomTo(zoom: number, focalPoint?: Point2D): void {
            commit(zoomTo(camera, zoom, clampZoom, focalPoint && toScreenPoint(focalPoint)));
        },

        zoomBy(factor: number, focalPoint: Point2D): void {
            commit(zoomBy(camera, factor, toScreenPoint(focalPoint), clampZoom));
        },

        reset(): void {
            commit(copyCamera(initial));
        },

        patch(partial: CameraPatch): void {
            commit(patchCamera(camera, partial, clampZoom));
        },
    };
}
