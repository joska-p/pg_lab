import type { ClockMixin, SurfaceBaseConfig } from '../core/surfaceTypes';
import type { CpuSurface } from './CpuSurface';
export type { CpuSurface } from './CpuSurface';

export interface CpuSurfaceConfig extends SurfaceBaseConfig, ClockMixin {
    canvas: HTMLCanvasElement;
}

export type CpuDraw = (surface: CpuSurface) => void;
