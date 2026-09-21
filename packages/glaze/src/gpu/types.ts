import type { GpuClockMixin, SurfaceBaseConfig } from '../core/surfaceTypes';
import type { GpuSurface } from './GpuSurface';
export type { GpuSurface } from './GpuSurface';

export interface GpuSurfaceConfig extends SurfaceBaseConfig, GpuClockMixin {
    canvas: HTMLCanvasElement;
}

export type GpuDraw = (surface: GpuSurface) => void;
