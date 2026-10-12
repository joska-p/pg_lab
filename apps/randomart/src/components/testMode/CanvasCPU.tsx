import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import { clamp, evaluate } from '../../core';
import type { Node } from '../../core';

interface CanvasCPUProps {
    node: Node;
    resolution: number;
    sizePx: number;
}

const styles = stylex.create({
    frame: {
        position: 'relative',
    },
    canvas: {
        display: 'block',
        imageRendering: 'pixelated',
    },
    error: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        textAlign: 'center',
    },
});

// Renders the node on a 2D canvas by evaluating the pure `evaluate` function per
// pixel. The loop / `performance.now` are the shell side of the same core the
// GPU canvas feeds to GLSL.
export function CanvasCPU({ node, resolution, sizePx }: CanvasCPUProps) {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        const buffer = new Uint8ClampedArray(resolution * resolution * 4);
        const startTime = performance.now();
        let frameId = 0;

        setError(null);

        const renderLoop = () => {
            const t = (performance.now() - startTime) / 1000;

            try {
                for (let py = 0; py < resolution; py++) {
                    for (let px = 0; px < resolution; px++) {
                        const x = (px / resolution) * 2 - 1;
                        const y = -((py / resolution) * 2 - 1);
                        const idx = (py * resolution + px) * 4;

                        const value = evaluate(node, x, y, t);
                        const gray = Math.round(clamp(value) * 127.5 + 127.5);

                        buffer[idx] = gray;
                        buffer[idx + 1] = gray;
                        buffer[idx + 2] = gray;
                        buffer[idx + 3] = 255;
                    }
                }

                ctx.putImageData(new ImageData(buffer, resolution, resolution), 0, 0);

                frameId = requestAnimationFrame(renderLoop);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Render error');
            }
        };

        renderLoop();

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [canvas, node, resolution]);

    return (
        <div {...stylex.props(styles.frame)} style={{ width: sizePx, height: sizePx }}>
            <canvas
                ref={setCanvas}
                width={resolution}
                height={resolution}
                {...stylex.props(styles.canvas)}
                style={{ width: sizePx, height: sizePx }}
            />
            {error && <div {...stylex.props(styles.error)}>{error}</div>}
        </div>
    );
}
