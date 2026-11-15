import type { GpuSurface } from '../gpu/GpuSurface';
import type { Program } from '../gpu/Program';
import type { UniformValue } from '../gpu/types';

export interface RenderFrameArgs {
    surface: GpuSurface;
    program: Program;
    uniforms?: Record<string, UniformValue>;
}

export interface RenderGpuFrameParams {
    surface: GpuSurface;
    program: Program | null;
    renderedProgram: Program | null;
    gate?: (surface: GpuSurface) => boolean;
    uniforms?: (surface: GpuSurface) => Record<string, UniformValue>;
    renderFrame?: (args: RenderFrameArgs) => void;
}

/**
 * Executes one frame render step, respecting render gating and delegating to renderFrame if
 * provided.
 */
export function renderGpuFrame({
    surface,
    program,
    renderedProgram,
    gate,
    uniforms,
    renderFrame,
}: RenderGpuFrameParams): Program | null {
    if (!program) {
        return renderedProgram;
    }

    const wanted = gate ? gate(surface) : true;
    if (!wanted && program === renderedProgram) {
        return renderedProgram;
    }

    const extraUniforms = uniforms?.(surface);
    if (renderFrame) {
        renderFrame({ surface, program, uniforms: extraUniforms });
    } else {
        surface.renderProgram(program, extraUniforms);
    }

    return program;
}
