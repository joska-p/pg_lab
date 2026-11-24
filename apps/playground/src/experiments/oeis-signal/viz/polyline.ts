import type { Signal } from '../core/types';
import type { Viz, VizTarget } from './types';

export interface PolylineOptions {
    maxTerms?: number;
    termsPerFrame?: number;
    yScale?: number;
    xSpacing?: number;
    color?: string;
    pointRadius?: number;
    lineWidth?: number;
    clearColor?: string;
}

export function createPolylineViz(options: PolylineOptions = {}): Viz {
    const {
        maxTerms = 120,
        termsPerFrame = 1,
        yScale = 1,
        xSpacing = 12,
        color = '#38bdf8',
        pointRadius = 3,
        lineWidth = 2,
        clearColor,
    } = options;

    const terms: number[] = [];
    let activeSignal: Signal | null = null;

    return {
        id: 'polyline',
        name: 'Polyline',

        render(signal: Signal, target: VizTarget) {
            if (activeSignal !== signal) {
                terms.length = 0;
                activeSignal = signal;
            }

            for (let i = 0; i < termsPerFrame; i++) {
                if (terms.length >= maxTerms) {
                    break;
                }
                const next = signal.next();
                if (next.done) {
                    break;
                }
                terms.push(next.value);
            }

            // Explicit render policy for polyline: clear + full redraw
            if (typeof target.clear === 'function') {
                target.clear(clearColor);
            } else {
                const { ctx, width, height } = target;
                ctx.save();
                if (clearColor !== undefined) {
                    ctx.fillStyle = clearColor;
                    ctx.fillRect(0, 0, width, height);
                } else {
                    ctx.clearRect(0, 0, width, height);
                }
                ctx.restore();
            }

            if (terms.length === 0) {
                return;
            }

            const points = terms.map((value, i) => ({
                x: i * xSpacing,
                y: -value * yScale,
            }));

            const { ctx } = target;
            ctx.save();

            // Single continuous stroke for polyline
            if (points.length > 1) {
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.beginPath();
                const first = points[0];
                if (first) {
                    ctx.moveTo(first.x, first.y);
                    for (let i = 1; i < points.length; i++) {
                        const p = points[i];
                        if (p) {
                            ctx.lineTo(p.x, p.y);
                        }
                    }
                }
                ctx.stroke();
            }

            // Draw point markers
            if (pointRadius > 0) {
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                for (const p of points) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            ctx.restore();
        },
    };
}
