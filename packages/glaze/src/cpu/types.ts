import type { CpuSurface } from "./CpuSurface";
import type { SurfaceBaseConfig } from "../core/surfaceTypes";
export type { CpuSurface } from "./CpuSurface";

export interface CpuSurfaceConfig extends SurfaceBaseConfig {
  canvas: HTMLCanvasElement;
}

export type CpuDraw = (surface: CpuSurface) => void;
