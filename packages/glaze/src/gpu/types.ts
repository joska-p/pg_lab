import type { GpuSurface } from "./GpuSurface";
import type { Camera } from "../core/Camera";
import type { Clock } from "../core/Clock";
import type { ClockOptions, DevicePixelRatio } from "../core/types";
export type { GpuSurface } from "./GpuSurface";

export interface GpuSurfaceConfig {
  canvas: HTMLCanvasElement;
  camera?: Camera;
  clock?: Clock;
  dpr?: DevicePixelRatio;
  clockOptions?: ClockOptions;
}

export type GpuDraw = (surface: GpuSurface) => void;
