import { useEffect, useRef } from 'react';

import { assemblePlanche } from './planche';
import type { PlancheRow } from './planche';

export interface PlancheProps {
    /** One row per grammar, one column per seed. */
    readonly rows: readonly PlancheRow[];
    /** Side of one cell, in pixels. */
    readonly cellSize: number;
}

/**
 * The displayed grid: **one** canvas, painted from a single assembled `ImageData` (friction 15).
 * The cells come from the reused offscreen surface in `renderer/batch.ts` — this component only
 * paints what it is given, it never touches WebGL.
 *
 * The canvas keeps its native resolution; CSS shrinks it to the panel width so a wide lot does not
 * force a horizontal scroll.
 */
export function Planche({ rows, cellSize }: PlancheProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Auto-memoized by React Compiler: only recomputed when the rows or the cell size change.
    const { width, height, rgba } = assemblePlanche(rows, cellSize);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) {
            return;
        }

        canvas.width = width;
        canvas.height = height;

        const image = ctx.createImageData(width, height);

        image.data.set(rgba);
        ctx.putImageData(image, 0, 0);
    }, [width, height, rgba]);

    return (
        <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Planche: ${String(rows.length)} grammars x ${String(cellSize)}px cells`}
            style={{
                display: 'block',
                width: '100%',
                maxWidth: `${String(width)}px`,
                height: 'auto',
                // Small cells are meant to be looked at, not smoothed: keep the pixels crisp.
                imageRendering: 'pixelated',
            }}
        />
    );
}
