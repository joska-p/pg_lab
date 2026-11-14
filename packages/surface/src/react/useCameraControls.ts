import type React from 'react';
import { useRef } from 'react';

import type { Camera2D } from '../core/Camera2D';
import { useLatest } from './useLatest';

// ---------------------------------------------------------------------------
// Types

/** Buttons that trigger panning. Mirrors the `PointerEvent.button` values. */
export type PanButton = 'left' | 'middle' | 'right';

export interface PanOptions {
    /**
     * Which pointer buttons trigger a pan drag. Defaults to `['middle']`.
     *
     * Pass `['left', 'middle']` to pan with both buttons, or `['left']` for left-only pan (useful
     * when left-click has no other meaning on the canvas).
     */
    buttons?: PanButton[];
}

export interface ZoomOptions {
    /**
     * Multiplier applied per 100 px of `deltaY`. Values > 1 zoom in on scroll-up. Defaults to
     * `1.15` (≈ 15 % per 100 px).
     */
    speed?: number;
}

export interface CameraControlsOptions {
    /**
     * Pan configuration. Pass `false` to disable panning entirely. Defaults to `{ buttons:
     * ['middle'] }`.
     */
    pan?: PanOptions | false;
    /** Wheel-zoom configuration. Pass `false` to disable wheel zoom. Defaults to `{ speed: 1.15 }`. */
    zoom?: ZoomOptions | false;
    /**
     * When `true`, a `onContextMenu` handler that calls `preventDefault()` is included in the
     * returned handlers (useful to suppress the right-click menu on the canvas). Defaults to
     * `false`.
     */
    suppressContextMenu?: boolean;
}

export interface CameraControlHandlers {
    onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void;
    onContextMenu: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

// ---------------------------------------------------------------------------
// Pure math helpers (exported for testing)

/**
 * Maps a `PointerEvent.button` integer to a `PanButton` label. Returns `null` for buttons that have
 * no label.
 */
export function buttonLabel(button: number): PanButton | null {
    if (button === 0) {
        return 'left';
    }
    if (button === 1) {
        return 'middle';
    }
    if (button === 2) {
        return 'right';
    }
    return null;
}

/**
 * Computes the zoom factor to apply for a given wheel delta.
 *
 * @param deltaY Raw `WheelEvent.deltaY` (positive = scroll down = zoom out).
 * @param speed Multiplier per 100 px of delta (default 1.15).
 * @returns A positive zoom factor (> 1 to zoom in, < 1 to zoom out).
 */
export function wheelZoomFactor(deltaY: number, speed = 1.15): number {
    // Normalize to a [-1, 1]-ish range so the speed is consistent across
    // devices regardless of whether the browser sends 100-px or 3-line deltas.
    const normalizedDelta = deltaY / 100;
    return speed ** -normalizedDelta;
}

/**
 * Computes the focal point of a wheel event in canvas-local CSS coordinates.
 *
 * @param clientX `WheelEvent.clientX`
 * @param clientY `WheelEvent.clientY`
 * @param rect `canvas.getBoundingClientRect()`
 */
export function wheelFocalPoint(
    clientX: number,
    clientY: number,
    rect: DOMRect,
): { x: number; y: number } {
    return { x: clientX - rect.left, y: clientY - rect.top };
}

// ---------------------------------------------------------------------------
// Hook internals

const DEFAULT_PAN_BUTTONS: PanButton[] = ['middle'];
const DEFAULT_ZOOM_SPEED = 1.15;

/**
 * Returns canvas event handlers that drive a `Camera2D` instance.
 *
 * ```tsx
 * const handlers = useCameraControls(camera, {
 *     pan: { buttons: ['left', 'middle'] },
 *     zoom: { speed: 1.2 },
 *     suppressContextMenu: true,
 * });
 * return <canvas {...handlers} />;
 * ```
 *
 * ### Pointer capture
 *
 * Pointer capture is set on `pointerdown` and released on `pointerup` / `pointercancel`. This
 * ensures that a drag that leaves the canvas boundary still fires `pointermove` events.
 *
 * ### Wheel zoom
 *
 * Zoom is anchored to the cursor position. The world point under the cursor stays fixed after the
 * zoom. `event.preventDefault()` is called to suppress page scroll.
 *
 * ### Context menu
 *
 * Pass `suppressContextMenu: true` to call `preventDefault()` on `contextmenu` events (useful when
 * right-click is used for panning).
 */
export function useCameraControls(
    camera: Camera2D,
    options: CameraControlsOptions = {},
): CameraControlHandlers {
    // Stable refs to the latest camera and options. These are only read inside event handlers
    // (outside render), so accessing `.current` there is React-safe.
    const cameraRef = useLatest(camera);
    const optionsRef = useLatest(options);

    // Mutable drag state — also only accessed in event handlers, never during render.
    const panPointerIdRef = useRef<number | null>(null);
    const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // ---------------------------------------------------------------------------
    // Handlers — recreated each render, but only read from refs at event time.
    // This is the same pattern as useCellPainting: simple, React Compiler-compatible.

    const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>): void => {
        const { pan } = optionsRef.current;

        if (pan === false) {
            return;
        }

        const panButtons = pan?.buttons ?? DEFAULT_PAN_BUTTONS;
        const label = buttonLabel(event.button);

        if (!label || !panButtons.includes(label)) {
            return;
        }

        event.preventDefault();
        lastPosRef.current = { x: event.clientX, y: event.clientY };
        panPointerIdRef.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>): void => {
        if (panPointerIdRef.current !== event.pointerId) {
            return;
        }

        const dx = event.clientX - lastPosRef.current.x;
        const dy = event.clientY - lastPosRef.current.y;
        lastPosRef.current = { x: event.clientX, y: event.clientY };

        cameraRef.current.panBy(dx, dy);
    };

    const releasePan = (event: React.PointerEvent<HTMLCanvasElement>): void => {
        if (panPointerIdRef.current !== event.pointerId) {
            return;
        }

        panPointerIdRef.current = null;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const onWheel = (event: React.WheelEvent<HTMLCanvasElement>): void => {
        const { zoom } = optionsRef.current;

        if (zoom === false) {
            return;
        }

        event.preventDefault();

        const speed = zoom?.speed ?? DEFAULT_ZOOM_SPEED;
        const factor = wheelZoomFactor(event.deltaY, speed);
        const rect = event.currentTarget.getBoundingClientRect();
        const focal = wheelFocalPoint(event.clientX, event.clientY, rect);

        cameraRef.current.zoomBy(factor, focal);
    };

    const onContextMenu = (event: React.MouseEvent<HTMLCanvasElement>): void => {
        if (optionsRef.current.suppressContextMenu) {
            event.preventDefault();
        }
    };

    return {
        onPointerDown,
        onPointerMove,
        onPointerUp: releasePan,
        onPointerCancel: releasePan,
        onWheel,
        onContextMenu,
    };
}
