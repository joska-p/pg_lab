import type { Point2D } from "./geometry";

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

/** Axis-aligned viewport bounds, typically from `getBoundingClientRect`. */
export interface ViewBounds {
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
  bounds?: () => ViewBounds;
}

export type TargetBinding = readonly [
  type: string,
  handler: EventListener,
  opts?: AddEventListenerOptions,
];
export type WindowBinding = readonly [type: string, handler: EventListener];
