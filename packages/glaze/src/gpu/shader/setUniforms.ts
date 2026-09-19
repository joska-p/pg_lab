import type { UniformEntry, UniformValue } from "./types";
import type { Camera } from "../../core/Camera";
import type { Point2D } from "../../core/types";

function isWebGLTextureValue(
  gl: WebGL2RenderingContext,
  value: UniformValue,
): value is WebGLTexture {
  return value instanceof WebGLTexture && gl.isTexture(value);
}

function setUniformValue(
  gl: WebGL2RenderingContext,
  entry: UniformEntry,
  value: UniformValue,
  nextTextureUnit?: () => number,
): void {
  const { location, type } = entry;

  if (isWebGLTextureValue(gl, value)) {
    const unit = nextTextureUnit ? nextTextureUnit() : 0;

    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, value);
    gl.uniform1i(location, unit);

    return;
  }

  switch (type) {
    case gl.FLOAT:
      if (typeof value === "number") gl.uniform1f(location, value);
      else gl.uniform1fv(location, value as Float32List);

      break;
    case gl.INT:
    case gl.BOOL:
    case gl.SAMPLER_2D:
      if (typeof value === "number") gl.uniform1i(location, value);
      else gl.uniform1iv(location, value as Int32List);

      break;
    case gl.FLOAT_VEC2:
      gl.uniform2fv(location, value as Float32List);
      break;
    case gl.FLOAT_VEC3:
      gl.uniform3fv(location, value as Float32List);
      break;
    case gl.FLOAT_VEC4:
      gl.uniform4fv(location, value as Float32List);
      break;
    case gl.INT_VEC2:
    case gl.BOOL_VEC2:
      gl.uniform2iv(location, value as Int32List);
      break;
    case gl.INT_VEC3:
    case gl.BOOL_VEC3:
      gl.uniform3iv(location, value as Int32List);
      break;
    case gl.INT_VEC4:
    case gl.BOOL_VEC4:
      gl.uniform4iv(location, value as Int32List);
      break;
    case gl.FLOAT_MAT2:
      gl.uniformMatrix2fv(location, false, value as Float32List);
      break;
    case gl.FLOAT_MAT3:
      gl.uniformMatrix3fv(location, false, value as Float32List);
      break;
    case gl.FLOAT_MAT4:
      gl.uniformMatrix4fv(location, false, value as Float32List);
      break;
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
  nextTextureUnit?: () => number,
): void {
  // `for...in` walks the keys directly: same order, no intermediate entries array per frame.
  for (const name in values) {
    const entry = uniforms.get(name);

    if (entry === undefined) continue;

    setUniformValue(gl, entry, values[name], nextTextureUnit);
  }
}

export function createStandardUniformValues(
  width: number,
  height: number,
  dpr: number,
  mouse?: Point2D,
  camera?: Camera,
  time?: number,
  clockTime?: number,
): Record<string, UniformValue> {
  const u_resolution = [width * dpr, width * dpr >= 0 ? height * dpr : 0]; // keep array
  const u_mouse = [
    mouse === undefined ? 0 : width > 0 ? mouse.x / width : 0,
    mouse === undefined ? 1 : height > 0 ? 1 - mouse.y / height : 1,
  ];
  const u_camera = [
    camera === undefined ? 0 : camera.x,
    camera === undefined ? 0 : camera.y,
    camera === undefined ? 1 : camera.zoom,
  ];

  return {
    u_resolution,
    u_aspect: height > 0 ? width / height : 0,
    u_mouse,
    u_camera,
    u_dpr: dpr,
    u_time: time ?? 0,
    u_clockTime: clockTime ?? time ?? 0,
  };
}
