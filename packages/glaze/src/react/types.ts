import type { Camera } from "../core/Camera";
import type { Clock } from "../core/Clock";
import type { InputRouter } from "../core/gestures";
import type {
  CameraControls,
  ClockOptions,
  DevicePixelRatio,
  DurationSeconds,
  InputStore,
  InteractionEvent,
  PanOptions,
  Point2D,
  Seconds,
  TimeSpeed,
  ZoomOptions,
} from "../core/types";
import type { CpuDraw, CpuSurface } from "../cpu/types";
import type { UniformValue } from "../gpu/shader/types";
import type { GpuDraw, GpuSurface } from "../gpu/types";
import type { CSSProperties } from "react";

// ---------------------------------------------------------------------------
// Observable & Store types
// ---------------------------------------------------------------------------

export type Notify = () => void;
export type Unsubscribe = () => void;

export interface Observable {
  notify(): void;
  subscribe(fn: Notify): Unsubscribe;
}

export interface ClockStore {
  clock: Clock;
  readonly time: Seconds;
  readonly deltaTime: Seconds;
  readonly duration: DurationSeconds | undefined;
  readonly progress: number;
  togglePlay(): void;
  play(): void;
  pause(): void;
  reset(): void;
  setSpeed(speed: TimeSpeed): void;
  subscribe(fn: () => void): () => void;
  getSnapshot(): Seconds;
  getIsPlaying(): boolean;
}

// ---------------------------------------------------------------------------
// Interaction & Gesture adapters
// ---------------------------------------------------------------------------

/**
 * `InteractionEvent` with a non-null `surface` — the pipeline only routes events while a surface is
 * mounted.
 */
export interface LiveInteractionEvent<TEvent, TSurface> extends Omit<
  InteractionEvent<TEvent, TSurface>,
  "surface"
> {
  surface: TSurface;
}

/**
 * `onStart` / `onMove` / `onZoom` replace the built-in pan/zoom; `onEnd` / `onContextMenu` run
 * alongside, so drag state always gets released. `pan` / `zoom` configure the built-ins (`false`
 * disables).
 */
export interface CanvasInteractions<TSurface> {
  pan?: boolean | PanOptions;
  zoom?: boolean | ZoomOptions;
  onStart?: (event: LiveInteractionEvent<PointerEvent, TSurface>) => void;
  onMove?: (event: LiveInteractionEvent<PointerEvent, TSurface>) => void;
  onEnd?: (event: LiveInteractionEvent<PointerEvent, TSurface>) => void;
  onZoom?: (event: LiveInteractionEvent<WheelEvent, TSurface>) => void;
  onContextMenu?: (event: LiveInteractionEvent<MouseEvent, TSurface>) => void;
}

// ---------------------------------------------------------------------------
// Surface Stack & Lifetime types
// ---------------------------------------------------------------------------

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

/** `initialCamera` only applies when no `camera` instance is provided. */
export interface CpuSurfaceOptions {
  camera?: Camera;
  cameraControls?: CameraControls;
  initialCamera?: InitialCamera;
  dpr?: DevicePixelRatio;
}

export interface GpuSurfaceOptions extends CpuSurfaceOptions {
  clock?: Clock;
  clockOptions?: ClockOptions;
}

/** One mounted CPU surface and everything wired to it; created and disposed together. */
export interface CpuStack {
  readonly surface: CpuSurface;
  readonly controls: CameraControls;
  readonly router: InputRouter<CpuSurface>;
}

/** One mounted GPU surface and everything wired to it; created and disposed together. */
export interface GpuStack {
  readonly surface: GpuSurface;
  readonly controls: CameraControls;
  readonly router: InputRouter<GpuSurface>;
  readonly clockStore: ClockStore;
}

export interface RoutableSurface {
  readonly input: InputStore;
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Canvas Components Props
// ---------------------------------------------------------------------------

export interface CpuCanvasProps extends CpuSurfaceOptions {
  onFrame?: CpuDraw;
  /**
   * Called exactly once per `CpuSurface` instance, right after it's created — the right place for
   * one-time setup.
   *
   * This guarantee holds regardless of how often the `onMount` callback itself changes identity
   * across renders: it is keyed to the surface, not to React's effect dependencies.
   */
  onMount?: (surface: CpuSurface) => void;
  canvasInteractions?: CanvasInteractions<CpuSurface>;
  className?: string;
  style?: CSSProperties;
}

export interface GpuCanvasProps extends GpuSurfaceOptions {
  /** Compiled on mount and recompiled whenever the source changes. */
  fragmentShader?: string;
  /** Computed from the surface before each frame's draw. */
  uniforms?: (surface: GpuSurface) => Record<string, UniformValue>;
  onFrame?: GpuDraw;
  /**
   * Called exactly once per `GpuSurface` instance, right after it's created — the right place for
   * one-time setup (`createProgram`, `createStateBuffer`, seeding simulation state).
   *
   * This guarantee holds regardless of how often the `onMount` callback itself changes identity
   * across renders: it is keyed to the surface, not to React's effect dependencies.
   */
  onMount?: (surface: GpuSurface) => void;
  /** Called once per `GpuSurface` instance, alongside `onMount`. */
  onClockStore?: (clockStore: ClockStore) => void;
  canvasInteractions?: CanvasInteractions<GpuSurface>;
  className?: string;
  style?: CSSProperties;
}
