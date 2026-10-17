import type { ColorModel } from '../color/index.ts';

export type SharingPolicy = 'shared' | 'all' | 'none';

export interface CompileOptions {
    readonly sharing?: SharingPolicy;
    /**
     * How the three channels become colour. `unrelated` (default) writes the channels straight to
     * RGB; `correlated` treats them as ONE field and samples a palette (the channel texts are
     * identical — the generator reuses the same node). Defaults to `UNRELATED_COLOR`.
     */
    readonly color?: ColorModel;
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
