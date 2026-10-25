import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';

import type { Path, Point } from '../core/types';
import {
    addPath,
    clearPaths,
    setStrokeColor,
    undoPath,
    useSketchpadPaths,
    useSketchpadStrokeColor,
} from '../stores/sketchpad';

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    colorInput: {
        width: '44px',
        height: '44px',
        border: 'none',
        background: 'transparent',
        padding: 0,
    },
    canvas: {
        aspectRatio: '3 / 2',
        width: '100%',
        display: 'block',
    },
});

function Sketchpad() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<Path>([]);

    const paths = useSketchpadPaths();
    const strokeColor = useSketchpadStrokeColor();

    function exportPaths() {
        if (paths.length === 0) {
            return;
        }

        const data = JSON.stringify(paths);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'paths.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function toCanvasPosition(e: React.MouseEvent<HTMLCanvasElement>): Point {
        if (!canvasRef.current) {
            return [0, 0];
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
    }

    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        const ctx = ctxRef.current;

        if (!ctx) {
            return;
        }

        isDrawingRef.current = true;
        const point = toCanvasPosition(e);

        currentPathRef.current = [point];

        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
    }

    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        const ctx = ctxRef.current;

        if (!ctx || !isDrawingRef.current) {
            return;
        }

        const point = toCanvasPosition(e);

        ctx.lineTo(point[0], point[1]);
        ctx.stroke();
        currentPathRef.current.push(point);
    }

    function handleMouseUp() {
        if (!isDrawingRef.current || currentPathRef.current.length === 0) {
            return;
        }

        const completedPath = [...currentPathRef.current];

        currentPathRef.current = [];
        isDrawingRef.current = false;

        addPath(completedPath);
    }

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        ctxRef.current = canvasRef.current.getContext('2d');
    }, []);

    useEffect(() => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;

        if (!ctx || !canvas) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        paths.forEach((path) => {
            if (path.length === 0) {
                return;
            }

            ctx.beginPath();
            ctx.strokeStyle = strokeColor;
            path.forEach((point, i) => {
                if (i === 0) {
                    ctx.moveTo(point[0], point[1]);
                } else {
                    ctx.lineTo(point[0], point[1]);
                }
            });
            ctx.stroke();
        });
    }, [paths, strokeColor]);

    return (
        <div {...stylex.props(styles.root)}>
            <Grid columns="4" gap="2">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => {
                            setStrokeColor(e.target.value);
                        }}
                        aria-label="stroke color"
                        {...stylex.props(styles.colorInput)}
                    />
                </label>

                <Button onClick={undoPath}>Undo</Button>

                <Button
                    color="error"
                    onClick={() => {
                        isDrawingRef.current = false;
                        currentPathRef.current = [];
                        clearPaths();
                    }}
                >
                    Clear
                </Button>

                <Button color="aurora" onClick={exportPaths}>
                    Export
                </Button>
            </Grid>
            <canvas
                ref={canvasRef}
                width={600}
                height={400}
                {...stylex.props(styles.canvas)}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            />
        </div>
    );
}

export { Sketchpad };
