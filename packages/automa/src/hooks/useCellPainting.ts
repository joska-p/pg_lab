import { useRef } from "react";

import { eventToGridPoint } from "../lib/coordinates";
import { paintCell, placeCreature } from "../stores/automa/actions";
import { automaStore } from "../stores/automa/store";

import type { GpuSurface } from "@repo/glaze/gpu/GpuSurface";
import type { CanvasInteractions, LiveInteractionEvent } from "@repo/glaze/react/types";

function paintAtEvent(event: PointerEvent, surface: GpuSurface): void {
  const canvas = event.currentTarget;

  if (!(canvas instanceof HTMLCanvasElement)) return;

  const { cols, rows, toolMode, paletteBrush } = automaStore.getState();
  const cell = eventToGridPoint(event, canvas, cols, rows, surface.camera);

  if (!cell) return;

  if (toolMode !== "erase" && paletteBrush !== "pixel") {
    placeCreature(cell.column, cell.row, paletteBrush);

    return;
  }

  paintCell(cell.column, cell.row, toolMode === "erase" ? 0 : 1);
}

export function useCellPainting(): CanvasInteractions<GpuSurface> {
  const isPainting = useRef(false);

  const onStart = ({
    nativeEvent,
    surface,
  }: LiveInteractionEvent<PointerEvent, GpuSurface>): void => {
    if (nativeEvent.button !== 0) return;

    isPainting.current = true;
    paintAtEvent(nativeEvent, surface);
  };

  const onMove = ({
    nativeEvent,
    surface,
  }: LiveInteractionEvent<PointerEvent, GpuSurface>): void => {
    if (!isPainting.current) return;

    paintAtEvent(nativeEvent, surface);
  };

  const onEnd = (_event: LiveInteractionEvent<PointerEvent, GpuSurface>): void => {
    isPainting.current = false;
  };

  const onContextMenu = ({ nativeEvent }: LiveInteractionEvent<MouseEvent, GpuSurface>): void => {
    nativeEvent.preventDefault();
  };

  return { onStart, onMove, onEnd, onContextMenu };
}
