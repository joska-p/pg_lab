import { Camera2D } from '../../../../lib/surface/core/Camera2D';
import { computeGridRect, getCellAtWorld } from './gridPlacement';
import type { GridCell } from './gridPlacement';

/** Resolves a pointer event to its grid cell, or null when it lands outside the grid. */
export function eventToGridPoint(
    event: { clientX: number; clientY: number },
    canvas: HTMLCanvasElement,
    cols: number,
    rows: number,
    camera?: Camera2D,
): GridCell | null {
    const bounds = canvas.getBoundingClientRect();
    const cam = camera ?? new Camera2D();
    const world = cam.screenToWorld({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
    });
    const rect = computeGridRect(bounds.width, bounds.height, cols, rows);

    return getCellAtWorld(rect, world, cols, rows);
}
