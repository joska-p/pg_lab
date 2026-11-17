export interface Point2D {
    x: number;
    y: number;
}

/** Viewport rectangle in CSS pixels. */
export interface Viewport {
    width: number;
    height: number;
}

export interface Camera2DOptions {
    /** Initial pan x (CSS pixels). Default: 0. */
    x?: number;
    /** Initial pan y (CSS pixels). Default: 0. */
    y?: number;
    /** Initial zoom level. Default: 1. */
    zoom?: number;
    /** Minimum zoom (clamp floor). Default: 0.001. */
    minZoom?: number;
    /** Maximum zoom (clamp ceiling). Default: 100_000. */
    maxZoom?: number;
}

type Subscriber = () => void;

/**
 * Lightweight 2D planar camera: pan, zoom, coordinate projection, subscription.
 *
 * All positions are in CSS pixels. `zoomBy` / `zoomTo` accept an optional focal point; without one
 * the origin (0, 0) is used as the anchor.
 *
 * Subscribe to changes with `subscribe`; check `getVersion()` to avoid re-renders when the value
 * did not change.
 */
export class Camera2D {
    // Public readable state (mutated only through the mutation methods below)
    #x: number;
    #y: number;
    #zoom: number;

    // Constructor-locked bounds
    readonly #minZoom: number;
    readonly #maxZoom: number;

    // Viewport (optional; needed for `aspect`)
    #viewport: Viewport | null = null;

    // Subscription / versioning
    #version = 0;
    readonly #subscribers = new Set<Subscriber>();

    constructor(options?: Camera2DOptions) {
        this.#minZoom = options?.minZoom ?? 0.001;
        this.#maxZoom = options?.maxZoom ?? 100_000;
        this.#x = options?.x ?? 0;
        this.#y = options?.y ?? 0;
        this.#zoom = this.#clampZoom(options?.zoom ?? 1);
    }

    // -------------------------------------------------------------------------
    // Public readable state

    get x(): number {
        return this.#x;
    }

    get y(): number {
        return this.#y;
    }

    get zoom(): number {
        return this.#zoom;
    }

    get minZoom(): number {
        return this.#minZoom;
    }

    get maxZoom(): number {
        return this.#maxZoom;
    }

    // -------------------------------------------------------------------------
    // Coordinate transforms

    /** Converts a CSS screen-space point to world-space. */
    screenToWorld(screen: Point2D): Point2D {
        return {
            x: (screen.x - this.#x) / this.#zoom,
            y: (screen.y - this.#y) / this.#zoom,
        };
    }

    /** Converts a world-space point to CSS screen-space. */
    worldToScreen(world: Point2D): Point2D {
        return {
            x: world.x * this.#zoom + this.#x,
            y: world.y * this.#zoom + this.#y,
        };
    }

    // -------------------------------------------------------------------------
    // Mutation methods

    /** Translates the camera by (dx, dy) in CSS pixels. */
    panBy(dx: number, dy: number): void {
        this.#x += dx;
        this.#y += dy;
        this.#bump();
    }

    /** Moves the camera so the world origin (0, 0) maps to screen position (x, y). */
    panTo(x: number, y: number): void {
        if (x === this.#x && y === this.#y) {
            return;
        }

        this.#x = x;
        this.#y = y;
        this.#bump();
    }

    /**
     * Multiplies the current zoom by `factor`, keeping the world point under `focal` stationary.
     * When `focal` is omitted the screen origin is used.
     */
    zoomBy(factor: number, focal?: Point2D): void {
        this.#applyZoom(this.#zoom * factor, focal);
    }

    /**
     * Sets the zoom to `zoom` (clamped to [minZoom, maxZoom]), keeping the world point under
     * `focal` stationary. When `focal` is omitted the screen origin is used.
     */
    zoomTo(zoom: number, focal?: Point2D): void {
        this.#applyZoom(zoom, focal);
    }

    /**
     * Applies a partial state update. Only provided keys are changed; unchanged keys are skipped
     * (and do not trigger a notification).
     */
    patch(state: { x?: number; y?: number; zoom?: number }): void {
        let changed = false;

        if (state.x !== undefined && state.x !== this.#x) {
            this.#x = state.x;
            changed = true;
        }

        if (state.y !== undefined && state.y !== this.#y) {
            this.#y = state.y;
            changed = true;
        }

        if (state.zoom !== undefined) {
            const clamped = this.#clampZoom(state.zoom);

            if (clamped !== this.#zoom) {
                this.#zoom = clamped;
                changed = true;
            }
        }

        if (changed) {
            this.#bump();
        }
    }

    /** Resets the camera to the given state (or to the initial defaults from the constructor). */
    reset(state?: { x?: number; y?: number; zoom?: number }): void {
        const nx = state?.x ?? 0;
        const ny = state?.y ?? 0;
        const nz = this.#clampZoom(state?.zoom ?? 1);

        if (nx === this.#x && ny === this.#y && nz === this.#zoom) {
            return;
        }

        this.#x = nx;
        this.#y = ny;
        this.#zoom = nz;
        this.#bump();
    }

    // -------------------------------------------------------------------------
    // Viewport

    /** Sets the CSS viewport used for `aspect`. */
    setViewport(viewport: Viewport): void {
        this.#viewport = viewport;
    }

    /** Returns the current CSS viewport, or null if none has been set. */
    getViewport(): Viewport | null {
        return this.#viewport;
    }

    /** Aspect ratio (width / height) of the current viewport, or 1 if no viewport is set. */
    get aspect(): number {
        const v = this.#viewport;
        return v && v.height > 0 ? v.width / v.height : 1;
    }

    // -------------------------------------------------------------------------
    // Subscription / versioning

    /**
     * Returns the current version counter. Increments on every mutation that changes the state.
     * Useful to implement efficient dirty-checks (e.g. `useSyncExternalStore` / `getSnapshot`).
     */
    getVersion(): number {
        return this.#version;
    }

    /**
     * Registers a subscriber called after every state change. Returns an unsubscribe function.
     * Subscribers are called synchronously inside the mutation methods.
     */
    subscribe(subscriber: Subscriber): () => void {
        this.#subscribers.add(subscriber);
        return () => {
            this.#subscribers.delete(subscriber);
        };
    }

    // -------------------------------------------------------------------------
    // Private helpers

    #clampZoom(z: number): number {
        return Math.min(Math.max(z, this.#minZoom), this.#maxZoom);
    }

    /** Zooms to `nextZoomRaw` (unclamped), keeping the world point under `focal` stable. */
    #applyZoom(nextZoomRaw: number, focal?: Point2D): void {
        const nextZoom = this.#clampZoom(nextZoomRaw);

        if (nextZoom === this.#zoom) {
            return;
        }

        if (focal) {
            // Keep the world point under `focal` fixed:
            //   world = (focal - pan) / zoom  →  pan = focal - world * nextZoom
            const worldX = (focal.x - this.#x) / this.#zoom;
            const worldY = (focal.y - this.#y) / this.#zoom;
            this.#x = focal.x - worldX * nextZoom;
            this.#y = focal.y - worldY * nextZoom;
        }

        this.#zoom = nextZoom;
        this.#bump();
    }

    #bump(): void {
        this.#version++;

        for (const sub of this.#subscribers) {
            sub();
        }
    }
}
