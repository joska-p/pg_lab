import type { Camera2D } from '@repo/surface/core/Camera2D';
import type React from 'react';
import { useRef } from 'react';

import { eventToGridPoint } from '../lib/coordinates';
import { paintCell, placeCreature } from '../stores/automa/actions';
import { automaStore } from '../stores/automa/store';

function paintAtEvent(event: React.PointerEvent<HTMLCanvasElement>, camera: Camera2D): void {
    const canvas = event.currentTarget;
    const { cols, rows, toolMode, paletteBrush } = automaStore.getState();
    const cell = eventToGridPoint(event, canvas, cols, rows, camera);

    if (!cell) {
        return;
    }

    if (toolMode !== 'erase' && paletteBrush !== 'pixel') {
        placeCreature(cell.column, cell.row, paletteBrush);
        return;
    }

    paintCell(cell.column, cell.row, toolMode === 'erase' ? 0 : 1);
}

type DragMode = 'paint' | 'pan';

export interface CellPaintingHandlers {
    onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void;
    onContextMenu: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

export function useCellPainting(camera: Camera2D): CellPaintingHandlers {
    const drag = useRef<DragMode | null>(null);
    const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>): void => {
        const canvas = event.currentTarget;
        lastPos.current = { x: event.clientX, y: event.clientY };

        if (event.button === 1) {
            // Middle-click: pan
            event.preventDefault();
            drag.current = 'pan';
            canvas.setPointerCapture(event.pointerId);
        } else if (event.button === 0) {
            // Left-click: paint
            drag.current = 'paint';
            paintAtEvent(event, camera);
            canvas.setPointerCapture(event.pointerId);
        }
    };

    const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>): void => {
        if (drag.current === 'paint') {
            paintAtEvent(event, camera);
        } else if (drag.current === 'pan') {
            const dx = event.clientX - lastPos.current.x;
            const dy = event.clientY - lastPos.current.y;
            camera.panBy(dx, dy);
        }
        lastPos.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>): void => {
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const onWheel = (event: React.WheelEvent<HTMLCanvasElement>): void => {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        const focalPoint = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
        const zoomFactor = event.deltaY < 0 ? 1.15 : 0.85;
        camera.zoomBy(zoomFactor, focalPoint);
    };

    const onContextMenu = (event: React.MouseEvent<HTMLCanvasElement>): void => {
        event.preventDefault();
    };

    return {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onWheel,
        onContextMenu,
    };
}
