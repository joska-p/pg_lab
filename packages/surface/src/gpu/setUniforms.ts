import type { UniformEntry, UniformValue } from './types';

function setUniformValue(
    gl: WebGL2RenderingContext,
    entry: UniformEntry,
    value: UniformValue,
): void {
    const { location, type } = entry;

    if (typeof value === 'number') {
        switch (type) {
            case gl.FLOAT: {
                gl.uniform1f(location, value);
                break;
            }
            case gl.INT:
            case gl.BOOL:
            case gl.SAMPLER_2D: {
                gl.uniform1i(location, value);
                break;
            }
        }
        return;
    }

    // Array or typed array
    switch (type) {
        case gl.FLOAT: {
            gl.uniform1fv(location, new Float32Array(value));
            break;
        }
        case gl.INT:
        case gl.BOOL: {
            gl.uniform1iv(location, new Int32Array(value));
            break;
        }
        case gl.FLOAT_VEC2: {
            gl.uniform2fv(location, new Float32Array(value));
            break;
        }
        case gl.FLOAT_VEC3: {
            gl.uniform3fv(location, new Float32Array(value));
            break;
        }
        case gl.FLOAT_VEC4: {
            gl.uniform4fv(location, new Float32Array(value));
            break;
        }
        case gl.INT_VEC2:
        case gl.BOOL_VEC2: {
            gl.uniform2iv(location, new Int32Array(value));
            break;
        }
        case gl.INT_VEC3:
        case gl.BOOL_VEC3: {
            gl.uniform3iv(location, new Int32Array(value));
            break;
        }
        case gl.INT_VEC4:
        case gl.BOOL_VEC4: {
            gl.uniform4iv(location, new Int32Array(value));
            break;
        }
        case gl.FLOAT_MAT2: {
            gl.uniformMatrix2fv(location, false, new Float32Array(value));
            break;
        }
        case gl.FLOAT_MAT3: {
            gl.uniformMatrix3fv(location, false, new Float32Array(value));
            break;
        }
        case gl.FLOAT_MAT4: {
            gl.uniformMatrix4fv(location, false, new Float32Array(value));
            break;
        }
    }
}

/**
 * Uploads uniforms; names with no matching active uniform are silently ignored, so one map can feed
 * programs with different uniform sets.
 */
export function setUniforms(
    gl: WebGL2RenderingContext,
    uniforms: Map<string, UniformEntry>,
    values: Record<string, UniformValue>,
): void {
    for (const name in values) {
        const entry = uniforms.get(name);

        if (entry === undefined) {
            continue;
        }

        const value = values[name];

        if (value === undefined) {
            continue;
        }

        setUniformValue(gl, entry, value);
    }
}

export interface StandardUniformInput {
    /** Canvas width in physical pixels. */
    width: number;
    /** Canvas height in physical pixels. */
    height: number;
    /** Wall time in seconds since start. */
    time: number;
    /** Delta in seconds since last frame. */
    timeDelta: number;
    /** Frame counter (integer). */
    frame: number;
    /**
     * Mouse state: [x, y] in CSS pixels (down position or 0,0), [lastClickX, lastClickY]. Matches
     * Shadertoy iMouse semantics: xy = current pos if button down (else 0), zw = last click.
     */
    mouse: readonly [number, number, number, number];
}

/** Builds the standard Shadertoy-compatible uniform values. */
export function buildStandardUniforms(input: StandardUniformInput): Record<string, UniformValue> {
    return {
        iResolution: [input.width, input.height, 1.0],
        iTime: input.time,
        iTimeDelta: input.timeDelta,
        iFrame: input.frame,
        iMouse: [...input.mouse],
    };
}
