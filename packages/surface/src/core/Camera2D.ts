export interface Point2D {
    x: number;
    y: number;
}

export interface Camera2DOptions {
    x?: number;
    y?: number;
    zoom?: number;
}

/** Lightweight 2D planar camera for pan, zoom, and coordinate projections. */
export class Camera2D {
    x: number;
    y: number;
    zoom: number;

    constructor(options?: Camera2DOptions) {
        this.x = options?.x ?? 0;
        this.y = options?.y ?? 0;
        this.zoom = options?.zoom ?? 1;
    }

    /** Transforms screen/DOM CSS coordinates to world coordinates. */
    screenToWorld(screen: Point2D): Point2D {
        return {
            x: (screen.x - this.x) / this.zoom,
            y: (screen.y - this.y) / this.zoom,
        };
    }

    /** Transforms world coordinates to screen/DOM CSS coordinates. */
    worldToScreen(world: Point2D): Point2D {
        return {
            x: world.x * this.zoom + this.x,
            y: world.y * this.zoom + this.y,
        };
    }

    /** Pans the camera by screen-space delta (dx, dy). */
    panBy(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Zooms the camera around a focal point on screen while keeping the point under the cursor
     * stable.
     */
    zoomAt(focalPoint: Point2D, factor: number, minZoom = 0.1, maxZoom = 128): void {
        const nextZoom = Math.min(Math.max(this.zoom * factor, minZoom), maxZoom);

        if (nextZoom === this.zoom) {
            return;
        }

        const world = this.screenToWorld(focalPoint);
        this.zoom = nextZoom;
        this.x = focalPoint.x - world.x * nextZoom;
        this.y = focalPoint.y - world.y * nextZoom;
    }

    reset(options?: Camera2DOptions): void {
        this.x = options?.x ?? 0;
        this.y = options?.y ?? 0;
        this.zoom = options?.zoom ?? 1;
    }
}
