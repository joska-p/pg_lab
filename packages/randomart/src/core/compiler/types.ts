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

/** Vertex in the lowered DAG. Created once per unique (context, operatorName, params, inputIds) key. */
export interface Vertex {
    readonly id: number;
    readonly operatorName: string;
    readonly params: readonly number[];
    readonly inputIds: readonly number[];
    readonly context: string;
    readonly requires: readonly string[];
}

/** Child coordinate context definition from a transformer operator. */
export interface ContextDef {
    readonly id: number;
    readonly name: string;
    readonly parentName: string;
    readonly operatorName: string;
    readonly params: readonly number[];
    readonly currentInputIds: readonly number[];
    readonly requires: readonly string[];
}

/** Item in the topographically ordered execution program. */
export type ProgramItem =
    | { readonly kind: 'vertex'; readonly vertex: Vertex }
    | { readonly kind: 'context'; readonly context: ContextDef };

export interface LowerResult {
    readonly vertices: readonly Vertex[];
    readonly contexts: readonly ContextDef[];
    readonly program: readonly ProgramItem[];
    readonly usages: readonly number[];
    readonly roots: readonly [number, number, number];
}

export interface EmitResult {
    readonly lines: readonly string[];
    readonly varCount: number;
    readonly channelTexts: readonly [string, string, string];
    readonly usedDeps: ReadonlySet<string>;
}

export interface PreambleResult {
    readonly preambleLines: readonly string[];
    readonly animated: boolean;
    readonly uniforms: readonly { name: string; glslType: 'float' }[];
}
