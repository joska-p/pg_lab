import type { UniformData, UniformEntry, UniformValue } from './types';

/**
 * Discriminates on the numeric side on purpose: `WebGLTexture` is an empty interface in lib.dom, so
 * a guard targeting it would make every other union member assignable to it and narrow to `never`.
 *
 * Uses `ArrayBuffer.isView` to catch all TypedArray subtypes (Float32Array, Int32Array, Uint8Array,
 * etc.) without enumerating them explicitly. Plain JS arrays and scalars are covered separately.
 */
function isUniformData(value: UniformValue): value is UniformData {
    return typeof value === 'number' || Array.isArray(value) || ArrayBuffer.isView(value);
}

function toFloat32Array(value: ArrayLike<number>): Float32Array {
    return value instanceof Float32Array ? value : Float32Array.from(value);
}

function toInt32Array(value: ArrayLike<number>): Int32Array {
    return value instanceof Int32Array ? value : Int32Array.from(value);
}

function setScalar(
    gl: WebGL2RenderingContext,
    { location, type }: UniformEntry,
    value: number,
): void {
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
}

function setVector(
    gl: WebGL2RenderingContext,
    { location, type }: UniformEntry,
    value: Exclude<UniformData, number>,
): void {
    switch (type) {
        case gl.FLOAT: {
            gl.uniform1fv(location, toFloat32Array(value));
            break;
        }
        case gl.FLOAT_VEC2: {
            gl.uniform2fv(location, toFloat32Array(value));
            break;
        }
        case gl.FLOAT_VEC3: {
            gl.uniform3fv(location, toFloat32Array(value));
            break;
        }
        case gl.FLOAT_VEC4: {
            gl.uniform4fv(location, toFloat32Array(value));
            break;
        }
        case gl.INT:
        case gl.BOOL: {
            gl.uniform1iv(location, toInt32Array(value));
            break;
        }
        case gl.INT_VEC2:
        case gl.BOOL_VEC2: {
            gl.uniform2iv(location, toInt32Array(value));
            break;
        }
        case gl.INT_VEC3:
        case gl.BOOL_VEC3: {
            gl.uniform3iv(location, toInt32Array(value));
            break;
        }
        case gl.INT_VEC4:
        case gl.BOOL_VEC4: {
            gl.uniform4iv(location, toInt32Array(value));
            break;
        }
        case gl.FLOAT_MAT2: {
            gl.uniformMatrix2fv(location, false, toFloat32Array(value));
            break;
        }
        case gl.FLOAT_MAT3: {
            gl.uniformMatrix3fv(location, false, toFloat32Array(value));
            break;
        }
        case gl.FLOAT_MAT4: {
            gl.uniformMatrix4fv(location, false, toFloat32Array(value));
            break;
        }
    }
}

function setData(gl: WebGL2RenderingContext, entry: UniformEntry, value: UniformData): void {
    if (typeof value === 'number') {
        setScalar(gl, entry, value);
    } else {
        setVector(gl, entry, value);
    }
}

function setTexture(
    gl: WebGL2RenderingContext,
    { location }: UniformEntry,
    texture: WebGLTexture,
    unit: number,
): void {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, unit);
}

/**
 * Uploads uniforms; names with no matching active uniform are silently ignored, so one map can feed
 * programs with different uniform sets. Textures are only bound to `sampler2D` uniforms and take
 * consecutive texture units in iteration order.
 */
export function setUniforms(
    gl: WebGL2RenderingContext,
    uniforms: Map<string, UniformEntry>,
    values: Record<string, UniformValue>,
): void {
    let textureUnit = 0;

    for (const name in values) {
        const entry = uniforms.get(name);
        const value = values[name];

        if (entry === undefined || value === undefined) {
            continue;
        }

        if (isUniformData(value)) {
            setData(gl, entry, value);
        } else if (entry.type === gl.SAMPLER_2D) {
            setTexture(gl, entry, value, textureUnit++);
        }
    }
}

export interface StandardUniformInput {
    /** Canvas width in physical (device) pixels — the `iResolution` width. */
    width: number;
    /** Canvas height in physical (device) pixels — the `iResolution` height. */
    height: number;
    /** Wall time in seconds since start. */
    time: number;
    /** Delta in seconds since last frame. */
    timeDelta: number;
    /** Frame counter (integer). */
    frame: number;
    /**
     * `[x, y, clickX, clickY]` in physical (device) pixels, with Shadertoy `iMouse` semantics: `x,
     * y` is the current position while the button is down (0, 0 otherwise), `clickX, clickY` is the
     * last click.
     */
    mouse: readonly [x: number, y: number, clickX: number, clickY: number];
}

/** Builds the standard Shadertoy-compatible uniform values. */
export function buildStandardUniforms(input: StandardUniformInput): Record<string, UniformValue> {
    return {
        iResolution: [input.width, input.height, 1],
        iTime: input.time,
        iTimeDelta: input.timeDelta,
        iFrame: input.frame,
        iMouse: input.mouse,
    };
}
