export type SharingPolicy = 'shared' | 'all' | 'none';

export interface CompileOptions {
    readonly sharing?: SharingPolicy;
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
