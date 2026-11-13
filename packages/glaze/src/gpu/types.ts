import type { ClockMixin, SurfaceBaseConfig } from '../core/surfaceTypes';
import type { GpuSurface } from './GpuSurface';
import type { Program } from './shader/Program';
import type { ShaderError } from './shader/ShaderError';
import type { UniformValue } from './shader/types';

export type { GpuSurface } from './GpuSurface';
export type { RenderTargetOptions } from './RenderTarget';

/** Physical pixel dimensions of a draw target (the default framebuffer or a RenderTarget). */
export interface Viewport {
    readonly width: number;
    readonly height: number;
}

export type UniformValues = Record<string, UniformValue>;

export interface GpuSurfaceConfig extends SurfaceBaseConfig, ClockMixin {
    canvas: HTMLCanvasElement;
    contextOptions?: WebGLContextAttributes;
}

export type GpuDraw = (surface: GpuSurface) => void;

export type TryProgramResult = { ok: true; program: Program } | { ok: false; error: ShaderError };
