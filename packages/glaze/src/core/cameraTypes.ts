import { assertFinite, assertStrictlyPositive, type Brand } from "./brands";
import type { Point2D } from "./geometry";

export type ZoomFactor = Brand<number, "ZoomFactor">;

export interface ZoomBounds {
  minZoom: number;
  maxZoom: number;
}

export function createZoomFactor(value: number): ZoomFactor {
  assertStrictlyPositive(value, "zoom factor");

  return value as ZoomFactor;
}

export function createZoomBounds(minZoom: number, maxZoom: number): ZoomBounds {
  assertStrictlyPositive(minZoom, "min zoom");
  assertStrictlyPositive(maxZoom, "max zoom");

  if (minZoom >= maxZoom) {
    throw new Error(
      `Glaze: min zoom (${String(minZoom)}) must be strictly below max zoom (${String(maxZoom)})`,
    );
  }

  return { minZoom, maxZoom };
}

export const DEFAULT_ZOOM_BOUNDS: ZoomBounds = createZoomBounds(0.05, 64);

/** Validated zoom policy — every value comes back finite, in bounds, and branded. */
export type ZoomClamp = (value: number) => ZoomFactor;

export function createZoomClamp(minZoom: number, maxZoom: number): ZoomClamp {
  const bounds = createZoomBounds(minZoom, maxZoom);

  return (value: number): ZoomFactor => {
    assertFinite(value, "zoom");

    return createZoomFactor(Math.max(bounds.minZoom, Math.min(bounds.maxZoom, value)));
  };
}

/**
 * Partial camera update accepted by `patchCamera`. Unlike a raw `Partial<Camera>` assign, `zoom`
 * flows through the active clamp, so no path can inject an out-of-bounds or degenerate value.
 */
export interface CameraPatch {
  x?: number;
  y?: number;
  zoom?: number;
}

/**
 * Mutable edge adapter over the pure transforms: raw numbers come in, each call recomputes a full
 * camera and commits it through this single write point. `reset()` restores the camera state
 * captured at controls creation.
 */
export interface CameraControls {
  panTo(position: Point2D): void;
  panBy(dx: number, dy: number): void;
  zoomTo(zoom: number, focalPoint?: Point2D): void;
  zoomAt(focalPoint: Point2D, zoom: number): void;
  zoomBy(factor: number, focalPoint: Point2D): void;
  reset(): void;
  patch(patch: CameraPatch): void;
}
