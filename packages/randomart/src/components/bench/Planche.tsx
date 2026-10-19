import { palette, radius } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';

import type { LotView } from './lot.ts';
import { assemblePlanche } from './planche.ts';

const styles = stylex.create({
    // `margin: auto` centres the planche in its viewport without clipping it when it overflows —
    // `justify-content: center` would cut off the left edge of a wide lot.
    frame: {
        position: 'relative',
        display: 'block',
        flexShrink: 0,
        margin: 'auto',
    },
    canvas: {
        display: 'block',
        width: '100%',
        height: 'auto',
    },
    // Selection rings are DOM, not canvas strokes: a 2px stroke in *image* pixels would be
    // invisible once the planche is scaled down, while a `box-shadow` stays 2px of screen.
    ring: {
        position: 'absolute',
        pointerEvents: 'none',
    },
    // The current grammar. Artwork has no idea what the theme is, so the rings are drawn in a
    // fixed near-white with a dark inner line: legible on any image, in any theme.
    rowRing: {
        left: 0,
        width: '100%',
        boxShadow: `inset 0 0 0 2px ${palette.light0Hard}, inset 0 0 0 3px ${palette.dark0Hard}`,
    },
    // The current seed stands out by its colour, not its thickness.
    cellRing: {
        boxShadow: `inset 0 0 0 2px ${colors.aqua}, inset 0 0 0 3px ${palette.dark0Hard}`,
    },
    hoverRing: {
        boxShadow: `inset 0 0 0 2px color-mix(in oklab, ${palette.light0Hard} 55%, transparent)`,
    },
    // Hovered seed index: a chip, because the planche has no room for a caption row.
    chip: {
        position: 'absolute',
        top: 2,
        left: 2,
        paddingBlock: 1,
        paddingInline: 4,
        fontSize: '0.6875rem',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.4,
        color: surface.foreground,
        backgroundColor: `color-mix(in oklab, ${surface.background} 78%, transparent)`,
        borderRadius: radius.sm,
    },
});

/** `n` cells out of `total` as a share of the planche, as a CSS percentage. */
function share(index: number, total: number): string {
    return `${String((index / total) * 100)}%`;
}

export interface PlancheProps {
    readonly lot: LotView;
    /** Native side of one cell, in pixels: what the renderer produced. */
    readonly cellSize: number;
    readonly selectedRowIndex?: number;
    readonly selectedColIndex?: number;
    /** Dim collapsed cells instead of showing them as if they were interesting. */
    readonly dimFlats?: boolean;
    /** `row` lays the planche out at native size; `sheet` fits it inside the stage. */
    readonly view?: 'sheet' | 'focus';
    readonly onCellClick?: (rowIndex: number, colIndex: number) => void;
}

/**
 * The displayed grid: **one** canvas, painted from a single assembled `ImageData`. The cells come
 * from the reused offscreen surface in `renderer/batch.ts` — this component only paints what it is
 * given, it never touches WebGL.
 *
 * The canvas is never upscaled: it is capped at its native size, so the browser only has to
 * _downscale_ it, where smooth interpolation beats nearest-neighbour moiré.
 */
export function Planche({
    lot,
    cellSize,
    selectedRowIndex,
    selectedColIndex,
    dimFlats = false,
    view = 'sheet',
    onCellClick,
}: PlancheProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

    // Auto-memoized by React Compiler: only recomputed when the lot, its flags or the size change.
    const { width, height, rgba } = assemblePlanche(lot.rows, cellSize, {
        columns: lot.columns,
        dim: dimFlats ? lot.flat : undefined,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        canvas.width = width;
        canvas.height = height;

        const image = context.createImageData(width, height);

        image.data.set(rgba);
        context.putImageData(image, 0, 0);
    }, [width, height, rgba]);

    /** Grid coordinates of a pointer event, in cells. `null` outside the planche. */
    const cellAt = (event: React.MouseEvent): { row: number; col: number } | null => {
        const frame = frameRef.current;

        if (!frame || lot.columns === 0 || lot.grammars === 0) {
            return null;
        }

        const rect = frame.getBoundingClientRect();
        const column = Math.floor(((event.clientX - rect.left) / rect.width) * lot.columns);
        const row = Math.floor(((event.clientY - rect.top) / rect.height) * lot.grammars);
        const targetRow = lot.rows[row];

        if (row < 0 || row >= lot.grammars || !targetRow) {
            return null;
        }

        if (column < 0 || column >= targetRow.length) {
            return null;
        }

        return { row, col: column };
    };

    const frameProps = stylex.props(styles.frame);
    const rowProps = stylex.props(styles.ring, styles.rowRing);
    const cellProps = stylex.props(styles.ring, styles.cellRing);
    const hoverProps = stylex.props(styles.ring, styles.hoverRing);
    const rows = lot.grammars;
    const columns = lot.columns;
    const rowIndex = selectedRowIndex ?? 0;
    const colIndex = selectedColIndex ?? 0;
    const hoverIsSelection = hovered?.row === rowIndex && hovered.col === colIndex;
    const cellBox = {
        top: share(rowIndex, rows),
        height: share(1, rows),
        left: share(colIndex, columns),
        width: share(1, columns),
    };

    return (
        <div
            ref={frameRef}
            className={frameProps.className}
            // Dynamic geometry: the display size is a multiple of the cell size, which StyleX
            // cannot know statically, and the fitted size depends on the stage's height. In sheet
            // mode the planche is capped by its native size *and* by the viewport height (`cqh`
            // units, see the viewport style): it never upscales and never overflows. In row mode it
            // is laid out at native size and the viewport scrolls.
            style={{
                ...frameProps.style,
                ...(view === 'focus'
                    ? {
                          width: '100%',
                          maxWidth: `calc(${String(rows > 0 ? columns / rows : 1)} * 100cqh)`,
                      }
                    : {
                          width: '100%',
                          maxWidth: `min(${String(width)}px, calc(${String(columns / rows)} * 100cqh))`,
                      }),
            }}
            onMouseMove={(event) => {
                const cell = cellAt(event);

                setHovered((previous) =>
                    previous?.row === cell?.row && previous?.col === cell?.col ? previous : cell,
                );
            }}
            onMouseLeave={() => {
                setHovered(null);
            }}
            onClick={(event) => {
                const cell = cellAt(event);

                if (cell) {
                    onCellClick?.(cell.row, cell.col);
                }
            }}
        >
            <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Planche: ${String(rows)} grammars, ${String(columns)} seeds each`}
                {...stylex.props(styles.canvas)}
            />

            {view === 'sheet' && rows > 0 ? (
                <div
                    aria-hidden
                    className={rowProps.className}
                    style={{
                        ...rowProps.style,
                        top: share(rowIndex, rows),
                        height: share(1, rows),
                    }}
                />
            ) : null}

            {hovered && !hoverIsSelection ? (
                <div
                    aria-hidden
                    className={hoverProps.className}
                    style={{
                        ...hoverProps.style,
                        top: share(hovered.row, rows),
                        height: share(1, rows),
                        left: share(hovered.col, columns),
                        width: share(1, columns),
                    }}
                >
                    <span {...stylex.props(styles.chip)}>{hovered.col + 1}</span>
                </div>
            ) : null}

            {rows > 0 && columns > 0 ? (
                <div
                    aria-hidden
                    className={cellProps.className}
                    style={{ ...cellProps.style, ...cellBox }}
                />
            ) : null}
        </div>
    );
}
