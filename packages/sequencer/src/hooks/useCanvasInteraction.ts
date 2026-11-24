import { useEffect } from 'react';

import { getViewportState, setViewport } from '../stores/ui/actions';

export function useCanvasInteraction(canvasRef: React.RefObject<HTMLCanvasElement | null>): void {
    useEffect(() => {
        const canvasEl = canvasRef.current;

        if (!canvasEl) {
            return;
        }

        const canvas: HTMLCanvasElement = canvasEl;

        let isPanning = false;
        let startX = 0;
        let startY = 0;
        let startPanX = 0;
        let startPanY = 0;

        function handleWheel(e: WheelEvent) {
            e.preventDefault();
            const vp = getViewportState();
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const zoomDelta = -e.deltaY / 500;
            const newZoom = Math.max(0.1, Math.min(5, vp.zoom * Math.exp(zoomDelta)));

            const newPanX = mx - (mx - vp.panX) * (newZoom / vp.zoom);
            const newPanY = my - (my - vp.panY) * (newZoom / vp.zoom);

            setViewport({
                enabled: true,
                zoom: Number(newZoom.toFixed(2)),
                panX: Number(newPanX.toFixed(2)),
                panY: Number(newPanY.toFixed(2)),
            });
        }

        function handleMouseDown(e: MouseEvent) {
            if (e.button !== 0) {
                return;
            }

            isPanning = true;
            startX = e.clientX;
            startY = e.clientY;
            const vp = getViewportState();

            startPanX = vp.panX;
            startPanY = vp.panY;

            if (!vp.enabled) {
                setViewport({ enabled: true });
            }

            canvas.style.cursor = 'grabbing';
        }

        function handleMouseMove(e: MouseEvent) {
            if (!isPanning) {
                return;
            }

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            setViewport({ panX: startPanX + dx, panY: startPanY + dy });
        }

        function handleMouseUp() {
            if (!isPanning) {
                return;
            }

            isPanning = false;
            canvas.style.cursor = '';
        }

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [canvasRef]);
}
