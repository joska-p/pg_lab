import { describe, expect, it } from 'vite-plus/test';

import { createSimpleSignal } from '../core/create-simple-signal';
import { createPolylineViz } from './polyline';
import type { VizTarget } from './types';

function createFakeTarget(): {
    target: VizTarget;
    clears: (string | undefined)[];
    drawnPaths: string[];
} {
    const clears: (string | undefined)[] = [];
    const drawnPaths: string[] = [];

    const fakeCtx = {
        strokeStyle: '',
        lineWidth: 1,
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: (x: number, y: number) => {
            drawnPaths.push(`M ${x} ${y}`);
        },
        lineTo: (x: number, y: number) => {
            drawnPaths.push(`L ${x} ${y}`);
        },
        arc: (x: number, y: number, r: number) => {
            drawnPaths.push(`A ${x} ${y} ${r}`);
        },
        stroke: () => {
            drawnPaths.push('STROKE');
        },
        clearRect: () => {},
        fillRect: () => {},
    } as unknown as CanvasRenderingContext2D;

    const target: VizTarget = {
        ctx: fakeCtx,
        width: 800,
        height: 600,
        dpr: 2,
        clear: (color?: string) => {
            clears.push(color);
        },
    };

    return { target, clears, drawnPaths };
}

describe('createPolylineViz', () => {
    it('implements growing term buffer and clear + full redraw render policy', () => {
        const viz = createPolylineViz({
            xSpacing: 10,
            yScale: 2,
            termsPerFrame: 1,
            maxTerms: 10,
            pointRadius: 3,
        });

        const signal = createSimpleSignal((n) => n * 10, { maxTerms: 5 });
        const { target, clears, drawnPaths } = createFakeTarget();

        // Frame 1: pulls term 0 (value 0). points = [{ x: 0, y: 0 }]
        viz.render(signal, target);
        expect(clears).toHaveLength(1);
        // Only 1 point, no line yet, 1 point circle
        expect(drawnPaths).toContain('A 0 0 3');
        expect(drawnPaths).not.toContain('M 0 0');

        // Frame 2: pulls term 1 (value 10). points = [{ x: 0, y: 0 }, { x: 10, y: -20 }]
        drawnPaths.length = 0;
        viz.render(signal, target);
        expect(clears).toHaveLength(2);
        // Line drawn: M 0 0, L 10 -20, STROKE
        expect(drawnPaths).toContain('M 0 0');
        expect(drawnPaths).toContain('L 10 -20');
        // Point circles drawn for both points
        expect(drawnPaths).toContain('A 0 0 3');
        expect(drawnPaths).toContain('A 10 -20 3');

        // Frame 3: pulls term 2 (value 20). points = 0, 1, 2
        drawnPaths.length = 0;
        viz.render(signal, target);
        expect(clears).toHaveLength(3);
        expect(drawnPaths).toContain('L 20 -40');
    });

    it('resets buffer when given a new signal', () => {
        const viz = createPolylineViz({ xSpacing: 5, yScale: 1, termsPerFrame: 1 });
        const signal1 = createSimpleSignal((n) => n, { maxTerms: 5 });
        const signal2 = createSimpleSignal((n) => n + 100, { maxTerms: 5 });
        const { target, drawnPaths } = createFakeTarget();

        viz.render(signal1, target);
        viz.render(signal1, target);

        drawnPaths.length = 0;
        // Swap to signal2
        viz.render(signal2, target);
        // Should have reset: only 1 point from signal2 (value 100, x = 0)
        expect(drawnPaths).toContain('A 0 -100 3');
        expect(drawnPaths).not.toContain('L 5 -1');
    });
});
