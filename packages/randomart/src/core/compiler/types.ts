import type { ChannelModel } from '../grammar/types';

/**
 * Sharing policy for lowered vertices.
 *
 * - None: everything inline, shared vertices are copied (can blow up exponentially with
 *   high-multiplicity operators like sqr or mix, hence MAX_SOURCE_LENGTH).
 * - Shared (default): a vertex gets a variable if used at least twice and its text is not an atom.
 * - All: every vertex is named, leaving the choice to the driver.
 */
export type SharingPolicy = 'shared' | 'all' | 'none';

export interface CompileOptions {
    readonly sharing?: SharingPolicy;
    /**
     * How the three channels become color: only `space` drives the emission (the conversion the
     * shader ends with). `shareDepth` is a generator concern — it decides the shape, not the
     * emitted code — and is ignored here. Defaults to `RAW_CHANNELS` (raw sRGB).
     */
    readonly channels?: ChannelModel;
}

interface CompiledShaderUniform {
    readonly name: string;
    readonly glslType: 'float';
}

interface CompiledShaderStats {
    readonly nodes: number;
    readonly vertices: number;
    readonly variables: number;
    readonly contexts: number;
    readonly sourceLength: number;
}

export interface CompiledShader {
    readonly source: string;
    readonly uniforms: readonly CompiledShaderUniform[];
    /**
     * Whether the shader reads `u_phase` (factual: the operator dependency closure). There is no
     * "static vs animated" shader type — a still image is a play frozen at some phase — this flag
     * only tells the render gate whether a phase change can alter the picture.
     */
    readonly animated: boolean;
    readonly stats: CompiledShaderStats;
}

export const MAX_SOURCE_LENGTH = 200_000;
