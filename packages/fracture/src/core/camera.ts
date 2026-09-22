/**
 * Wheel zoom factor for the fracture scenes. Glaze's ZoomGesture applies `exp(−deltaY · speed)`;
 * twice the glaze default (0.002) so the wheel keeps pace with the fracture shaders' zoom speed.
 */
export const ZOOM_WHEEL_SPEED = 1 / 250;

/**
 * Complex-plane width of the view at zoom = 1. The shaders map (uv − 0.5) · (3 / zoom) onto the
 * complex plane, so the camera → center mapping uses this fixed width.
 */
export const WORLD_SCALE = 3.0;

export interface ComplexCenter {
    centerRe: number;
    centerIm: number;
}

/**
 * Map the interaction camera onto the complex-plane center the Mandelbrot shaders expect. With the
 * shader convention c = (uv − 0.5) · (3 / zoom) + center, the center is (−W·aspect·panNormX − 0.5 −
 * 0.5·W·aspect·drift, W·panNormY + 0.5·W·drift); the drift terms pin the anchor to screenToWorld
 * across zoom.
 */
export function cameraToComplex(
    x: number,
    y: number,
    zoom: number,
    width: number,
    height: number,
): ComplexCenter {
    const safeWidth = width > 0 ? width : 1;
    const safeHeight = height > 0 ? height : 1;
    const panNormX = x / zoom / safeWidth;
    const panNormY = y / zoom / safeHeight;
    const aspect = safeWidth / safeHeight;
    const drift = 1.0 - 1.0 / zoom;

    return {
        centerRe: -WORLD_SCALE * aspect * panNormX - 0.5 - 0.5 * WORLD_SCALE * aspect * drift,
        centerIm: WORLD_SCALE * panNormY + 0.5 * WORLD_SCALE * drift,
    };
}

/** Inverse of `cameraToComplex`: screen-space camera position for a complex center at a zoom. */
export function complexToCamera(
    centerRe: number,
    centerIm: number,
    zoom: number,
    width: number,
    height: number,
): { x: number; y: number } {
    const safeWidth = width > 0 ? width : 1;
    const safeHeight = height > 0 ? height : 1;
    const aspect = safeWidth / safeHeight;
    const drift = 1.0 - 1.0 / zoom;
    const factor = (zoom * safeHeight) / WORLD_SCALE;

    return {
        x: -factor * (centerRe + 0.5 + 0.5 * WORLD_SCALE * aspect * drift),
        y: factor * (centerIm - 0.5 * WORLD_SCALE * drift),
    };
}
