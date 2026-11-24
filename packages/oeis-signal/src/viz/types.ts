import type { Signal } from '../core/types';

/** Structural target type for 2D canvas visualizers — keeps viz runtime-agnostic. */
export interface VizTarget {
    readonly ctx: CanvasRenderingContext2D;
    readonly width: number;
    readonly height: number;
    readonly dpr: number;
    clear?(color?: string): void;
}

export interface Viz {
    readonly id: string;
    readonly name: string;

    /** Called every frame — the viz pulls from the signal as it needs. */
    render(signal: Signal, target: VizTarget): void;
}
