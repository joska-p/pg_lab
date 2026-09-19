import type { InputStore } from "./InputStore";
export type { Camera } from "./Camera";
export type { Clock } from "./Clock";
export type { InputStore } from "./InputStore";

// ---------------------------------------------------------------------------
// Brands & Primitive refinements
// ---------------------------------------------------------------------------

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type ZoomFactor = Brand<number, "ZoomFactor">;
export type DurationSeconds = Brand<number, "DurationSeconds">;
export type TimeSpeed = Brand<number, "TimeSpeed">;
export type WheelSpeed = Brand<number, "WheelSpeed">;
export type Seconds = Brand<number, "Seconds">;

/**
 * Refinement of `Seconds` (assignable wherever `Seconds` is expected) rather than a sibling
 * `Brand`: stacking two brands on the same `__brand` key would intersect to `never`.
 */
export type NonNegativeSeconds = Seconds & { readonly __nonNegative: true };
export type Milliseconds = Brand<number, "Milliseconds">;

const MS_PER_SECOND = 1000;

export function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`Glaze: ${label} must be a finite number, received ${String(value)}`);
  }
}

export function assertStrictlyPositive(value: number, label: string): void {
  assertFinite(value, label);

  if (value <= 0) {
    throw new Error(`Glaze: ${label} must be strictly positive, received ${String(value)}`);
  }
}

export function createZoomFactor(value: number): ZoomFactor {
  assertStrictlyPositive(value, "zoom factor");

  return value as ZoomFactor;
}

export function createDurationSeconds(value: number): DurationSeconds {
  assertStrictlyPositive(value, "duration");

  return value as DurationSeconds;
}

export function createTimeSpeed(value: number): TimeSpeed {
  assertStrictlyPositive(value, "time speed");

  return value as TimeSpeed;
}

export function createWheelSpeed(value: number): WheelSpeed {
  assertStrictlyPositive(value, "wheel speed");

  return value as WheelSpeed;
}

export function createSeconds(value: number): Seconds {
  assertFinite(value, "seconds");

  return value as Seconds;
}

export function createNonNegativeSeconds(value: number): NonNegativeSeconds {
  assertFinite(value, "seconds");

  if (value < 0) {
    throw new Error(`Glaze: seconds must not be negative, received ${String(value)}`);
  }

  return value as NonNegativeSeconds;
}

export function createMilliseconds(value: number): Milliseconds {
  assertFinite(value, "milliseconds");

  return value as Milliseconds;
}

export function msToSeconds(value: number): Seconds {
  return createSeconds(value / MS_PER_SECOND);
}

export function secondsToMs(value: number): Milliseconds {
  return createMilliseconds(value * MS_PER_SECOND);
}

// ---------------------------------------------------------------------------
// Shapes & rendering brands
// ---------------------------------------------------------------------------

export type CssColor = Brand<string, "CssColor">;
export type PositiveNumber = Brand<number, "PositiveNumber">;
export type FontSize = Brand<number, "FontSize">;
export type CanvasDimension = Brand<number, "CanvasDimension">;
export type BufferDimension = Brand<number, "BufferDimension">;
export type DevicePixelRatio = Brand<number, "DevicePixelRatio">;
export type StateData = Brand<Uint8Array, "StateData">;
export type NormalizedVec2 = Brand<{ readonly x: number; readonly y: number }, "NormalizedVec2">;
export type LineSegment = Brand<{ readonly a: Point2D; readonly b: Point2D }, "LineSegment">;

export function createNormalizedVec2(x: number, y: number): NormalizedVec2 {
  const lenSq = x * x + y * y;

  if (!Number.isFinite(lenSq) || Math.abs(lenSq - 1) > 1e-4) {
    throw new Error(
      `Glaze: vector must be normalized (x² + y² ≈ 1), received (${String(x)}, ${String(y)}) with length² ${String(lenSq)}`,
    );
  }

  return { x, y } as NormalizedVec2;
}

export function createLineSegment(a: Point2D, b: Point2D): LineSegment {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (Math.hypot(dx, dy) === 0) {
    throw new Error(
      `Glaze: line segment endpoints must be distinct, received a=(${String(a.x)}, ${String(a.y)}) and b=(${String(b.x)}, ${String(b.y)})`,
    );
  }

  return { a, b } as LineSegment;
}

export function createBufferDimension(value: number): BufferDimension {
  if (!Number.isFinite(value) || value < 1) {
    throw new Error(`Glaze: buffer dimension must be >= 1, received ${String(value)}`);
  }

  return value as BufferDimension;
}

export function createStateData(
  data: Uint8Array,
  width: BufferDimension,
  height: BufferDimension,
): StateData {
  const expectedLength = width * height;

  if (data.length !== expectedLength) {
    throw new Error(
      `Glaze: StateData length ${String(data.length)} does not match ${String(width)}x${String(height)} cells`,
    );
  }

  return data as StateData;
}

export function createCssColor(value: string): CssColor {
  if (value.length === 0) {
    throw new Error("Glaze: color must not be empty");
  }

  return value as CssColor;
}

export function createPositiveNumber(value: number): PositiveNumber {
  assertStrictlyPositive(value, "positive number");

  return value as PositiveNumber;
}

export function createFontSize(value: number): FontSize {
  assertStrictlyPositive(value, "font size");

  return value as FontSize;
}

export function createCanvasDimension(value: number): CanvasDimension {
  if (!Number.isFinite(value) || value < 1) {
    throw new Error(`Glaze: canvas dimension must be >= 1, received ${String(value)}`);
  }

  return value as CanvasDimension;
}

export function createDevicePixelRatio(value: number): DevicePixelRatio {
  assertStrictlyPositive(value, "device pixel ratio");

  return value as DevicePixelRatio;
}

// ---------------------------------------------------------------------------
// 2D Points & Camera types
// ---------------------------------------------------------------------------

export interface Point2D {
  x: number;
  y: number;
}

export type ScreenPoint = Brand<Point2D, "ScreenPoint">;
export type WorldPoint = Brand<Point2D, "WorldPoint">;
export type ScreenDelta = Brand<Point2D, "ScreenDelta">;
export type WorldDelta = Brand<Point2D, "WorldDelta">;

export interface ZoomBounds {
  minZoom: number;
  maxZoom: number;
}

export function assertFinitePoint(point: Point2D, label: string): void {
  assertFinite(point.x, `${label} x`);
  assertFinite(point.y, `${label} y`);
}

export function toScreenPoint(point: Point2D): ScreenPoint {
  assertFinitePoint(point, "screen point");

  return point as ScreenPoint;
}

export function toWorldPoint(point: Point2D): WorldPoint {
  assertFinitePoint(point, "world point");

  return point as WorldPoint;
}

export function toScreenDelta(delta: Point2D): ScreenDelta {
  assertFinitePoint(delta, "screen delta");

  return delta as ScreenDelta;
}

export function toWorldDelta(delta: Point2D): WorldDelta {
  assertFinitePoint(delta, "world delta");

  return delta as WorldDelta;
}

export function createZoomBounds(minZoom: number, maxZoom: number): ZoomBounds {
  assertStrictlyPositive(minZoom, "min zoom");
  assertStrictlyPositive(maxZoom, "max zoom");

  if (minZoom >= maxZoom) {
    throw new Error(
      `Glaze: min zoom (${String(minZoom)}) must be strictly below max zoom (${String(maxZoom)})`,
    );
  }

  return { minZoom, maxZoom };
}

export const DEFAULT_ZOOM_BOUNDS: ZoomBounds = createZoomBounds(0.05, 64);

/** Validated zoom policy — every value comes back finite, in bounds, and branded. */
export type ZoomClamp = (value: number) => ZoomFactor;

export function createZoomClamp(minZoom: number, maxZoom: number): ZoomClamp {
  const bounds = createZoomBounds(minZoom, maxZoom);

  return (value: number): ZoomFactor => {
    assertFinite(value, "zoom");

    return createZoomFactor(Math.max(bounds.minZoom, Math.min(bounds.maxZoom, value)));
  };
}

/**
 * Partial camera update accepted by `patchCamera`. Unlike a raw `Partial<Camera>` assign, `zoom`
 * flows through the active clamp, so no path can inject an out-of-bounds or degenerate value.
 */
export interface CameraPatch {
  x?: number;
  y?: number;
  zoom?: number;
}

/**
 * Mutable edge adapter over the pure transforms: raw numbers come in, each call recomputes a full
 * camera and commits it through this single write point. `reset()` restores the camera state
 * captured at controls creation.
 */
export interface CameraControls {
  panTo(position: Point2D): void;
  panBy(dx: number, dy: number): void;
  zoomTo(zoom: number, focalPoint?: Point2D): void;
  zoomAt(focalPoint: Point2D, zoom: number): void;
  zoomBy(factor: number, focalPoint: Point2D): void;
  reset(): void;
  patch(patch: CameraPatch): void;
}

// ---------------------------------------------------------------------------
// Clock types
// ---------------------------------------------------------------------------

export interface ClockRuntimeOptions {
  /** Multiplier applied to every delta; defaults to 1. */
  speed?: TimeSpeed;
  /** Whether the clock starts playing immediately; defaults to true. */
  autoStart?: boolean;
}

export type FreeClockOptions = ClockRuntimeOptions & { mode?: "free" };

export type TimedClockOptions = ClockRuntimeOptions & {
  mode: "timed";
  duration: DurationSeconds;
  /** Wraps back to the start after reaching the end; defaults to true. */
  loop?: boolean;
  /** Reflects at both ends instead of wrapping; takes precedence over `loop`. */
  pingPong?: boolean;
};

/** A clock is either free-running or timed — there is no duration-less ping-pong to ignore. */
export type ClockOptions = FreeClockOptions | TimedClockOptions;

/** Resolved config mirroring the options union, so `update()` dispatches on the same shape. */
export type ClockState =
  | { kind: "free" }
  | { kind: "timed"; duration: DurationSeconds; loop: boolean; pingPong: boolean };

// ---------------------------------------------------------------------------
// FrameLoop types
// ---------------------------------------------------------------------------

declare const frameTokenBrand: unique symbol;

/** Proof that a frame is actively being dispatched; issued fresh by the loop on every tick. */
export interface FrameToken {
  readonly [frameTokenBrand]: true;
}

/** The owner's frame step: stamped state, then the loop fans out to subscribers. */
export type FrameStep = (time: Seconds, delta: NonNegativeSeconds, frameToken: FrameToken) => void;

/** One subscriber of the frame fan-out, invoked by the owner's step via `runFrameSubscribers`. */
export type FrameSubscriber = () => void;

/** Environment capabilities of the heartbeat; defaults bind it to the browser's rAF clock. */
export interface FrameLoopOptions {
  /** Reads the wall clock in milliseconds; defaults to `performance.now()`. */
  now?: () => Milliseconds;
  /** Schedules the next tick and returns its canceller; defaults to `requestAnimationFrame`. */
  schedule?: (callback: (time: Milliseconds) => void) => () => void;
}

// ---------------------------------------------------------------------------
// InputStore types
// ---------------------------------------------------------------------------

export type PointerEventName = "pointerdown" | "pointermove" | "pointerup" | "pointercancel";

export type PointerHandlerName =
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel";

/** Proof that `attach()` has been called; consumed by `detach()`. */
export interface AttachedHandle {
  readonly __brand: "AttachedHandle";
}

/** Abstraction over DOM event subscription; swap in tests without touching the global `window`. */
export interface EventSource {
  on(
    target: HTMLElement,
    type: string,
    cb: EventListener,
    opts?: AddEventListenerOptions,
  ): () => void;
  onWindow(type: string, cb: EventListener): () => void;
}

/** Axis-aligned rectangle, typically from `getBoundingClientRect`. */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** `point` is canvas-relative, in CSS pixels. */
export interface InputHandlers {
  onPointerDown?: (event: PointerEvent, point: Point2D) => void;
  onPointerMove?: (event: PointerEvent, point: Point2D) => void;
  onPointerUp?: (event: PointerEvent, point: Point2D) => void;
  onPointerCancel?: (event: PointerEvent, point: Point2D) => void;
  onWheel?: (event: WheelEvent, point: Point2D) => void;
  onContextMenu?: (event: MouseEvent) => void;
}

export interface InputStoreOptions {
  eventSource?: EventSource;
  bounds?: () => Rect;
}

export type TargetBinding = readonly [
  type: string,
  handler: EventListener,
  opts?: AddEventListenerOptions,
];
export type WindowBinding = readonly [type: string, handler: EventListener];

// ---------------------------------------------------------------------------
// Gestures & Interaction types
// ---------------------------------------------------------------------------

/** Per-wheel-pixel exponential zoom rate, validated once at import. */
export const DEFAULT_WHEEL_SPEED: WheelSpeed = createWheelSpeed(0.002);

export interface PanOptions {
  button?: number | number[];
}

export interface ZoomOptions {
  /** Raw at the boundary; validated to be strictly positive and finite at construction. */
  speed?: number;
}

export interface InteractionEvent<TEvent, TSurface> {
  nativeEvent: TEvent;
  point: ScreenPoint;
  input: InputStore;
  cameraControls: CameraControls;
  surface: TSurface | null;
}

/**
 * Every gesture receives every event and decides to handle or ignore it — there is no consume
 * protocol. Returning `true` from `onStart` claims the interaction, and the router captures the
 * pointer; `onCancel` lets the router release transient state when disposed mid-interaction.
 */
export interface Gesture<TSurface> {
  /** Return exactly `true` to claim the interaction; pointer capture is router policy. */
  onStart?: (event: InteractionEvent<PointerEvent, TSurface>) => unknown;
  onMove?: (event: InteractionEvent<PointerEvent, TSurface>) => void;
  onEnd?: (event: InteractionEvent<PointerEvent, TSurface>) => void;
  onZoom?: (event: InteractionEvent<WheelEvent, TSurface>) => void;
  onContextMenu?: (event: InteractionEvent<MouseEvent, TSurface>) => void;
  /** Release transient state; called by the router on dispose, mid-drag included. */
  onCancel?: () => void;
}

export interface InputRouterOptions<TSurface> {
  input: InputStore;
  cameraControls: CameraControls;
  getSurface(): TSurface | null;
  getGestures(): Gesture<TSurface>[];
}
