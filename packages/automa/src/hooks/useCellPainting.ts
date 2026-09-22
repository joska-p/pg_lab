import type { GpuSurface } from '@repo/glaze/gpu/GpuSurface';
import type { CanvasInteractions, LiveInteractionEvent } from '@repo/glaze/react/types';
import { useRef } from 'react';

import { eventToGridPoint } from '../lib/coordinates';
import { paintCell, placeCreature } from '../stores/automa/actions';
import { automaStore } from '../stores/automa/store';

function paintAtEvent(event: PointerEvent, surface: GpuSurface): void {
    const canvas = event.currentTarget;

    if (!(canvas instanceof HTMLCanvasElement)) return;

    const { cols, rows, toolMode, paletteBrush } = automaStore.getState();
    const cell = eventToGridPoint(event, canvas, cols, rows, surface.camera);

    if (!cell) return;

    if (toolMode !== 'erase' && paletteBrush !== 'pixel') {
        placeCreature(cell.column, cell.row, paletteBrush);

        return;
    }

    paintCell(cell.column, cell.row, toolMode === 'erase' ? 0 : 1);
}

type DragMode = 'paint' | 'pan';

export function useCellPainting(): CanvasInteractions<GpuSurface> {
    // `onStart`/`onMove` replace glaze's built-in pan (createInteractionAdapter only
    // registers PanGesture when both are absent), so middle-drag panning lives here.
    const drag = useRef<DragMode | null>(null);

    const onStart = (event: LiveInteractionEvent<PointerEvent, GpuSurface>): void => {
        const { nativeEvent, surface } = event;

        if (nativeEvent.button === 1) {
            // Stop the browser's middle-click autoscroll while we own the drag.
            nativeEvent.preventDefault();
            drag.current = 'pan';
        } else if (nativeEvent.button === 0) {
            drag.current = 'paint';
            paintAtEvent(nativeEvent, surface);
        } else {
            return;
        }

        // Mirror the router's capture policy: a claimed drag keeps receiving
        // events when the cursor leaves the canvas.
        const canvas = nativeEvent.currentTarget;

        if (canvas instanceof HTMLCanvasElement) {
            canvas.setPointerCapture(nativeEvent.pointerId);
        }
    };

    const onMove = (event: LiveInteractionEvent<PointerEvent, GpuSurface>): void => {
        if (drag.current === 'paint') {
            paintAtEvent(event.nativeEvent, event.surface);
        } else if (drag.current === 'pan') {
            event.cameraControls.panBy(event.input.pointerDelta.x, event.input.pointerDelta.y);
        }
    };

    const onEnd = (_event: LiveInteractionEvent<PointerEvent, GpuSurface>): void => {
        drag.current = null;
    };

    const onContextMenu = ({ nativeEvent }: LiveInteractionEvent<MouseEvent, GpuSurface>): void => {
        nativeEvent.preventDefault();
    };

    return { onStart, onMove, onEnd, onContextMenu };
}
