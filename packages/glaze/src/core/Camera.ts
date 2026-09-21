import { assertFinite } from './brands';
import { createZoomFactor, type ZoomFactor } from './cameraTypes';
import { toScreenPoint, toWorldPoint, type ScreenPoint, type WorldPoint } from './geometry';

/** Passive state — it never mutates itself; panning and zooming live in `CameraControls`. */
export class Camera {
    x: number;
    y: number;
    zoom: ZoomFactor;

    constructor(x: number, y: number, zoom: ZoomFactor) {
        this.x = x;
        this.y = y;
        this.zoom = zoom;
    }

    /** Returns a new point; never mutates its arguments. */
    screenToWorld(screen: ScreenPoint): WorldPoint {
        return toWorldPoint({
            x: (screen.x - this.x) / this.zoom,
            y: (screen.y - this.y) / this.zoom,
        });
    }

    worldToScreen(world: WorldPoint): ScreenPoint {
        return toScreenPoint({
            x: world.x * this.zoom + this.x,
            y: world.y * this.zoom + this.y,
        });
    }
}

export function createCamera(x: number, y: number, zoom: ZoomFactor): Camera {
    assertFinite(x, 'camera x');
    assertFinite(y, 'camera y');

    return new Camera(x, y, zoom);
}

export const defaultCamera = (): Camera => createCamera(0, 0, createZoomFactor(1));

/** Fresh camera with identical state — the snapshot primitive behind `reset()` semantics. */
export function copyCamera(camera: Camera): Camera {
    return createCamera(camera.x, camera.y, camera.zoom);
}
