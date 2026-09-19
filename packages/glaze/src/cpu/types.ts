import type { CpuSurface } from "./CpuSurface";
import type { Camera } from "../core/Camera";
import type { DevicePixelRatio } from "../core/types";
export type { CpuSurface } from "./CpuSurface";

export interface CpuSurfaceConfig {
  canvas: HTMLCanvasElement;
  camera?: Camera;
  dpr?: DevicePixelRatio;
}

export type CpuDraw = (surface: CpuSurface) => void;
