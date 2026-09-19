import type { CameraControls } from "../core/cameraTypes";
import type { InputRouter } from "../core/gestures";
import type { Point2D } from "../core/geometry";
import type { InputStore } from "../core/InputStore";
import type { CpuSurface } from "../cpu/types";
import type { GpuSurface } from "../gpu/types";
import type { ClockStore } from "./types";

/** Resource created alongside a surface node; `dispose` runs exactly once at detach. */
export interface StackDisposable {
  dispose(): void;
}

/** Declared spawn state of a camera created by the stack; `reset()` restores it. */
export interface InitialCamera {
  zoom?: number;
  pan?: Point2D;
  minZoom?: number;
  maxZoom?: number;
}

/** One mounted CPU surface and everything wired to it; created and disposed together. */
export interface CpuStack {
  readonly surface: CpuSurface;
  readonly cameraControls: CameraControls;
  readonly inputRouter: InputRouter<CpuSurface>;
}

/** One mounted GPU surface and everything wired to it; created and disposed together. */
export interface GpuStack {
  readonly surface: GpuSurface;
  readonly cameraControls: CameraControls;
  readonly inputRouter: InputRouter<GpuSurface>;
  readonly clockStore: ClockStore;
}

export interface RoutableSurface {
  readonly input: InputStore;
  destroy(): void;
}
