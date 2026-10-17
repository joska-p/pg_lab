import { useEffect, useRef } from 'react';

import { assemblePlanche } from './planche';
import type { PlancheRow } from './planche';

export interface PlancheProps {
    /** One row per grammar, one column per seed. */
    readonly rows: readonly PlancheRow[];
    /** Side of one cell, in pixels. */
    readonly cellSize: number;
    readonly selectedRowIndex?: number;
    readonly selectedCell?: { rowIndex: number; colIndex: number } | null;
    readonly onCellClick?: (rowIndex: number, colIndex: number) => void;
}

/**
 * The displayed grid: **one** canvas, painted from a single assembled `ImageData` (friction 15).
 * The cells come from the reused offscreen surface in `renderer/batch.ts` — this component only
 * paints what it is given, it never touches WebGL.
 *
 * The canvas keeps its native resolution; CSS shrinks it to the panel width so a wide lot does not
 * force a horizontal scroll.
 */
export function Planche({
    rows,
    cellSize,
    selectedRowIndex,
    selectedCell,
    onCellClick,
}: PlancheProps) {
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

        // Highlight selected row if specified
        if (
            selectedRowIndex !== undefined &&
            selectedRowIndex >= 0 &&
            selectedRowIndex < rows.length
        ) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, selectedRowIndex * cellSize + 1, width - 2, cellSize - 2);

            // Highlight specific selected cell if specified
            if (
                selectedCell &&
                selectedCell.rowIndex === selectedRowIndex &&
                selectedCell.colIndex >= 0
            ) {
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    selectedCell.colIndex * cellSize + 1,
                    selectedCell.rowIndex * cellSize + 1,
                    cellSize - 2,
                    cellSize - 2,
                );
            }
            ctx.restore();
        }
    }, [width, height, rgba, cellSize, rows.length, selectedRowIndex, selectedCell]);

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas || !onCellClick) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        const colIndex = Math.floor(x / cellSize);
        const rowIndex = Math.floor(y / cellSize);

        const targetRow = rows[rowIndex];
        if (
            rowIndex >= 0 &&
            rowIndex < rows.length &&
            targetRow &&
            colIndex >= 0 &&
            colIndex < targetRow.length
        ) {
            onCellClick(rowIndex, colIndex);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Planche: ${String(rows.length)} grammars x ${String(cellSize)}px cells`}
            onClick={handleClick}
            style={{
                display: 'block',
                width: '100%',
                maxWidth: `${String(width)}px`,
                height: 'auto',
                cursor: onCellClick ? 'pointer' : 'default',
                // Small cells are meant to be looked at, not smoothed: keep the pixels crisp.
                imageRendering: 'pixelated',
            }}
        />
    );
}
