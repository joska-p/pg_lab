import type { Label } from '../../core/types';

export interface ChartPoint {
    drawingId: number | null;
    label: Label | 'current';
    x: number;
    y: number;
}

export type Domain = [number, number];

export interface ChartBounds {
    xDomain: Domain;
    yDomain: Domain;
}
