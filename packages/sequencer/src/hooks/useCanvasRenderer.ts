import { useEffect, useRef } from 'react';

import { render } from '../core/render';
import type { CanvasViewport, LayerConfigEntry } from '../core/types';

export function useCanvasRenderer(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    sequence: number[],
    layers: LayerConfigEntry[],
    viewport: CanvasViewport,
): void {
    const sequenceRef = useRef(sequence);
    const layersRef = useRef(layers);
    const viewportRef = useRef(viewport);
    const rafRef = useRef<number | null>(null);

    const draw = () => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const parent = canvas.parentElement;

        if (!parent) {
            return;
        }

        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        render(canvas, sequenceRef.current, layersRef.current, viewportRef.current);
    };

    // Keep refs in sync for rAF reads
    useEffect(() => {
        sequenceRef.current = sequence;
    }, [sequence]);
    useEffect(() => {
        layersRef.current = layers;
    }, [layers]);
    useEffect(() => {
        viewportRef.current = viewport;
    }, [viewport]);

    // Sequence/layers change → render immediately
    useEffect(() => {
        draw();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sequence, layers]);

    // Viewport change → throttle via rAF
    useEffect(() => {
        if (rafRef.current !== null) {
            return;
        }

        rafRef.current = requestAnimationFrame(() => {
            draw();
            rafRef.current = null;
        });

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewport]);

    // Worker redraw requests → render immediately
    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        function onRequestDraw() {
            draw();
        }
        canvas.addEventListener('sequence-renderer:request-draw', onRequestDraw);

        return () => {
            canvas.removeEventListener('sequence-renderer:request-draw', onRequestDraw);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
