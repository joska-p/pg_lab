import { assertStrictlyPositive, type Brand } from "./brands";
import type { CameraControls } from "./cameraTypes";
import type { ScreenPoint } from "./geometry";
import type { InputStore } from "./InputStore";

export type WheelSpeed = Brand<number, "WheelSpeed">;

export function createWheelSpeed(value: number): WheelSpeed {
  assertStrictlyPositive(value, "wheel speed");

  return value as WheelSpeed;
}

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
