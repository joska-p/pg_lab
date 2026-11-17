export interface UniformEntry {
    location: WebGLUniformLocation;
    /** GLenum reported by `getActiveUniform` (e.g. `gl.FLOAT_VEC3`). */
    type: GLenum;
    /** Array length reported by `getActiveUniform` (1 for non-array uniforms). */
    size: number;
}

/** Numeric uniform data: a scalar, or a flattened vector / matrix / array of those. */
export type UniformData = number | readonly number[] | Float32Array | Int32Array;

/** Supported uniform values: numeric data, or a 2D texture bound to a sampler. */
export type UniformValue = UniformData | WebGLTexture;

export interface CompiledShaderProgram {
    program: WebGLProgram;
    uniforms: Map<string, UniformEntry>;
}
