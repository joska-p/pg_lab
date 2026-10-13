import type { GpuClockMixin, SurfaceBaseConfig } from '../core/surfaceTypes';
import type { GpuSurface } from './GpuSurface';
import type { Program } from './shader/Program';
import type { ShaderError } from './shader/ShaderError';

export type { GpuSurface } from './GpuSurface';

export interface GpuSurfaceConfig extends SurfaceBaseConfig, GpuClockMixin {
    canvas: HTMLCanvasElement;
    contextOptions?: WebGLContextAttributes;
}

export type GpuDraw = (surface: GpuSurface) => void;

export type TryProgramResult = { ok: true; program: Program } | { ok: false; error: ShaderError };
