import type { CssColor } from '../core/render';
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

/** Options passed to a single program render pass. */
export interface RenderPassOptions {
    /** Clear color before drawing, or null/undefined to preserve existing pixels. */
    readonly clear?: CssColor | null;
    /**
     * Blend mode during the pass. 'alpha' (default) preserves standard alpha blending. 'none'
     * disables blending, completely replacing destination pixels.
     */
    readonly blend?: 'alpha' | 'none';
}

export interface GpuSurfaceConfig extends SurfaceBaseConfig, ClockMixin {
    canvas: HTMLCanvasElement;
    contextOptions?: WebGLContextAttributes;
}

export type GpuDraw = (surface: GpuSurface) => void;

export type TryProgramResult = { ok: true; program: Program } | { ok: false; error: ShaderError };
