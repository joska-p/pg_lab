import type { Point2D } from '@repo/glaze/core/geometry';

export interface GridRect {
    /** World units per cell edge. */
    scale: number;
    /** World x of the rect's left edge. */
    originX: number;
    /** World y of the rect's top edge; world is Y-down like the DOM. */
    originY: number;
}

export interface GridCell {
    column: number;
    row: number;
    index: number;
}

/**
 * 'contain' fit of a cols×rows grid into a canvas-sized world box, centered on the world origin so
 * the default camera (x=0, y=0, zoom=1) frames it exactly.
 *
 * Single source of truth shared by the display shader and pointer picking: both sides must map
 * positions through this rect to stay cell-aligned at every zoom level.
 */
export function computeGridRect(
    canvasWidth: number,
    canvasHeight: number,
    cols: number,
    rows: number,
): GridRect {
    if (canvasWidth <= 0 || canvasHeight <= 0 || cols <= 0 || rows <= 0) {
        return { scale: 1, originX: 0, originY: 0 };
    }

    const scale = Math.min(canvasWidth / cols, canvasHeight / rows);

    return {
        scale,
        originX: (canvasWidth - cols * scale) / 2,
        originY: (canvasHeight - rows * scale) / 2,
    };
}

/** Maps a world point (`Camera.screenToWorld` space) to its grid cell, or null outside the grid. */
export function getCellAtWorld(
    rect: GridRect,
    world: Point2D,
    cols: number,
    rows: number,
): GridCell | null {
    const column = Math.floor((world.x - rect.originX) / rect.scale);
    const rowFromTop = Math.floor((world.y - rect.originY) / rect.scale);

    if (column < 0 || column >= cols || rowFromTop < 0 || rowFromTop >= rows) {
        return null;
    }

    // The grid texture stores row 0 at the bottom (GL convention) while the
    // world counts downward from the top edge; flip exactly once here.
    const row = rows - 1 - rowFromTop;

    return { column, row, index: row * cols + column };
}
