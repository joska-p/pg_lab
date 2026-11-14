import type { Program } from '../gpu/Program';
import type { Surface } from '../gpu/Surface';
import type { UniformValue } from '../gpu/types';

export interface RenderFrameArgs {
    surface: Surface;
    program: Program;
    uniforms?: Record<string, UniformValue>;
}

export interface RenderSurfaceFrameParams {
    surface: Surface;
    program: Program | null;
    renderedProgram: Program | null;
    gate?: (surface: Surface) => boolean;
    uniforms?: (surface: Surface) => Record<string, UniformValue>;
    renderFrame?: (args: RenderFrameArgs) => void;
}

/**
 * Executes one frame render step, respecting render gating and delegating to renderFrame if
 * provided.
 */
export function renderSurfaceFrame({
    surface,
    program,
    renderedProgram,
    gate,
    uniforms,
    renderFrame,
}: RenderSurfaceFrameParams): Program | null {
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
