import type { Camera } from "./Camera";
import type { Clock } from "./Clock";
import type { ClockOptions } from "./clockTypes";
import type { DevicePixelRatio } from "./render";

/** Shared base for imperative surface configs (`canvas` is added per surface kind). */
export interface SurfaceBaseConfig {
  camera?: Camera;
  dpr?: DevicePixelRatio;
}

/** Clock mixin for GPU surfaces (CPU surfaces have no clock). */
export interface GpuClockMixin {
  clock?: Clock;
  clockOptions?: ClockOptions;
}
