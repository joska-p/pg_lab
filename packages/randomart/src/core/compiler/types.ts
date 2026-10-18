import type { ChannelModel } from '../color/index.ts';
import type { MotionLevel } from '../motion/index.ts';

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
     * How the three channels become colour: only `space` drives the emission (the conversion the
     * shader ends with). `shareDepth` is a generator concern — it decides the shape, not the
     * emitted code — and is ignored here. Defaults to `RAW_CHANNELS` (raw sRGB).
     */
    readonly channels?: ChannelModel;
    /**
     * How the coordinates move with `u_phase` (see `../motion`). Defaults to `'off'` — the static
     * baseline. A non-`off` motion makes the shader read `u_phase`, so `animated` is true and the
     * play button is meaningful.
     */
    readonly motion?: MotionLevel;
}

export interface CompiledShaderUniform {
    readonly name: string;
    readonly glslType: 'float';
}

export interface CompiledShaderStats {
    readonly nodes: number;
    readonly vertices: number;
    readonly variables: number;
    readonly contexts: number;
    readonly sourceLength: number;
}

export interface CompiledShader {
    readonly source: string;
    readonly uniforms: readonly CompiledShaderUniform[];
    readonly animated: boolean;
    readonly stats: CompiledShaderStats;
}

export const MAX_SOURCE_LENGTH = 200_000;
