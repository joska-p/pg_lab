import { defaultCamera, type Camera } from "@repo/glaze/core/Camera";
import { toScreenPoint } from "@repo/glaze/core/geometry";
import { computeGridRect, getCellAtWorld, type GridCell } from "./gridPlacement";

/** Resolves a pointer event to its grid cell, or null when it lands outside the grid. */
export function eventToGridPoint(
  event: { clientX: number; clientY: number },
  canvas: HTMLCanvasElement,
  cols: number,
  rows: number,
  camera?: Camera,
): GridCell | null {
  const bounds = canvas.getBoundingClientRect();
  const cam = camera ?? defaultCamera();
  const world = cam.screenToWorld(
    toScreenPoint({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }),
  );
  const rect = computeGridRect(bounds.width, bounds.height, cols, rows);

  return getCellAtWorld(rect, world, cols, rows);
}
