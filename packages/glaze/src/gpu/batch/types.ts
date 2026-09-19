import type { Camera } from "../../core/Camera";

/** 3x3 matrix in the layout WebGL expects; `uniformMatrix3fv` takes it as-is. */
export type Mat3 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface ShapeBatcherOptions {
  gl: WebGL2RenderingContext;
  camera: Camera;
  getViewport: () => { width: number; height: number };
}
