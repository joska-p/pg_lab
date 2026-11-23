import type { CardGraphic } from './types';

export const SIZE = 300;

export function emptyGraphic(): CardGraphic {
    return {
        paths: [],
        circles: [],
        ellipses: [],
        lines: [],
        rects: [],
    };
}

export function f(n: number): string {
    return n.toFixed(1);
}

export function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

export function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
