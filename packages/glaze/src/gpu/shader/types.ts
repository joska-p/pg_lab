export interface UniformEntry {
    location: WebGLUniformLocation;
    type: number;
    size: number;
}

/** Uniform values; a `WebGLTexture` is bound to a texture unit automatically. */
export type UniformValue = number | number[] | Float32Array | Int32Array | WebGLTexture;

export interface CompiledShaderProgram {
    program: WebGLProgram;
    uniforms: Map<string, UniformEntry>;
}
