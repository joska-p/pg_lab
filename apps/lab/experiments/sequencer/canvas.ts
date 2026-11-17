/*
 * Canvas lifecycle and viewport interactions. CanvasStage owns the DPR-scaled
 * backing store and the ResizeObserver; there is deliberately no permanent
 * animation loop — repaints are one-shot and coalesced on the next frame.
 */

import { CanvasStage } from '../../ui/canvas-stage';
import { render } from './core/render';
import { sequenceState, setViewport, subscribe, uiState } from './state';

export interface SequencerCanvas {
    requestPaint: () => void;
    destroy: () => void;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function round(value: number): number {
    return Math.round(value * 100) / 100;
}

export function createSequencerCanvas(
    canvas: HTMLCanvasElement,
    signal: AbortSignal,
): SequencerCanvas {
    let stage: CanvasStage | null = null;
    let pendingFrame = 0;
    let destroyed = false;
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;

    function paint(): void {
        const active = stage;

        if (!active || destroyed) {
            return;
        }

        render(
            active.canvas,
            active.size,
            sequenceState.sequence,
            uiState.layers,
            uiState.viewport,
        );
    }

    function requestPaint(): void {
        if (destroyed || pendingFrame !== 0) {
            return;
        }

        pendingFrame = requestAnimationFrame(() => {
            pendingFrame = 0;
            paint();
        });
    }

    stage = new CanvasStage(canvas, { onResize: requestPaint });

    const unsubscribeState = subscribe((topic) => {
        if (topic === 'viewport') {
            requestPaint();
        } else {
            paint();
        }
    });

    canvas.addEventListener(
        'wheel',
        (event) => {
            event.preventDefault();

            const viewport = uiState.viewport;
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const newZoom = clamp(viewport.zoom * Math.exp(-event.deltaY / 500), 0.1, 5);
            const ratio = newZoom / viewport.zoom;

            setViewport({
                enabled: true,
                zoom: newZoom,
                panX: round(mouseX - (mouseX - viewport.panX) * ratio),
                panY: round(mouseY - (mouseY - viewport.panY) * ratio),
            });
        },
        { passive: false, signal },
    );

    canvas.addEventListener(
        'mousedown',
        (event) => {
            if (event.button !== 0) {
                return;
            }

            const viewport = uiState.viewport;

            isPanning = true;
            startX = event.clientX;
            startY = event.clientY;
            startPanX = viewport.panX;
            startPanY = viewport.panY;
            canvas.style.cursor = 'grabbing';

            if (!viewport.enabled) {
                setViewport({ enabled: true });
            }
        },
        { signal },
    );

    window.addEventListener(
        'mousemove',
        (event) => {
            if (!isPanning) {
                return;
            }

            setViewport({
                panX: startPanX + (event.clientX - startX),
                panY: startPanY + (event.clientY - startY),
            });
        },
        { signal },
    );

    window.addEventListener(
        'mouseup',
        () => {
            if (!isPanning) {
                return;
            }

            isPanning = false;
            canvas.style.cursor = 'grab';
        },
        { signal },
    );

    function destroy(): void {
        if (destroyed) {
            return;
        }

        destroyed = true;

        if (pendingFrame !== 0) {
            cancelAnimationFrame(pendingFrame);
            pendingFrame = 0;
        }

        unsubscribeState();
        stage?.destroy();
        stage = null;
    }

    return { requestPaint, destroy };
}
