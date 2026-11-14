export interface UniformEntry {
    location: WebGLUniformLocation;
    type: number;
    size: number;
}

/** Supported uniform value types. */
export type UniformValue = number | number[] | Float32Array | Int32Array;

export interface CompiledShaderProgram {
    program: WebGLProgram;
    uniforms: Map<string, UniformEntry>;
}
