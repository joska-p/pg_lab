import type { FrameToken } from "./frameTypes";
import type { Point2D } from "./geometry";
import type {
  AttachedHandle,
  EventSource,
  InputHandlers,
  InputStoreOptions,
  PointerEventName,
  PointerHandlerName,
  TargetBinding,
  ViewBounds,
  WindowBinding,
} from "./inputTypes";

/** Approximate CSS pixels per line — used to normalise wheel deltaMode === 1. */
const LINE_HEIGHT_PX = 16;

const POINTER_HANDLER_BY_EVENT: Record<PointerEventName, PointerHandlerName> = {
  pointerdown: "onPointerDown",
  pointermove: "onPointerMove",
  pointerup: "onPointerUp",
  pointercancel: "onPointerCancel",
};

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const domEventSource: EventSource = {
  on(target, type, cb, opts) {
    target.addEventListener(type, cb, opts);

    return () => {
      target.removeEventListener(type, cb, opts);
    };
  },

  onWindow(type, cb) {
    window.addEventListener(type, cb);

    return () => {
      window.removeEventListener(type, cb);
    };
  },
};

/**
 * Raw input signal bus for a canvas; transient state (`wasKeyPressed`, `wheelDelta`) is cleared by
 * `endFrame()`.
 *
 * All environment dependencies are injected via `EventSource` and `bounds` — zero implicit reads of
 * `window` or DOM layout in production (the defaults bind to them transparently).
 */
export class InputStore {
  readonly pointer: Point2D = { x: 0, y: 0 };
  readonly pointerDelta: Point2D = { x: 0, y: 0 };
  readonly wheelPosition: Point2D = { x: 0, y: 0 };
  wheelDelta = 0;
  readonly #source: EventSource;
  #bounds: () => ViewBounds;
  readonly #keys = new Set<string>();
  readonly #pressed = new Set<string>();
  readonly #subscribers = new Set<InputHandlers>();
  #mouseDown = false;
  #mouseButtons = 0;
  #handle: AttachedHandle | null = null;
  #cancelBindings: (() => void)[] = [];
  #lastPointer: Point2D = { x: 0, y: 0 };
  readonly #targetBindings: TargetBinding[];
  readonly #windowBindings: WindowBinding[];

  constructor(options: InputStoreOptions = {}) {
    this.#source = options.eventSource ?? domEventSource;
    this.#bounds = options.bounds ?? (() => ({ left: 0, top: 0, width: 0, height: 0 }));

    // `addEventListener` expects `EventListener` (Event → void) but our handlers
    // are typed more precisely (PointerEvent, WheelEvent …). The cast is intentional
    // and localised here — this table is where all DOM impurity is concentrated.
    this.#targetBindings = [
      ["pointermove", this.#onPointerMove as EventListener],
      ["pointerdown", this.#onPointerDown as EventListener],
      ["pointerup", this.#onPointerUp as EventListener],
      ["pointercancel", this.#onPointerCancel as EventListener],
      ["wheel", this.#onWheel as EventListener, { passive: false }],
      ["contextmenu", this.#onContextMenu as EventListener],
    ];

    this.#windowBindings = [
      ["keydown", this.#onKeyDown as EventListener],
      ["keyup", this.#onKeyUp as EventListener],
    ];
  }

  get mouseDown(): boolean {
    return this.#mouseDown;
  }

  get mouseButtons(): number {
    return this.#mouseButtons;
  }

  isKeyDown(code: string): boolean {
    return this.#keys.has(code);
  }

  wasKeyPressed(code: string): boolean {
    return this.#pressed.has(code);
  }

  subscribe(handlers: InputHandlers): () => void {
    this.#subscribers.add(handlers);

    return () => {
      this.#subscribers.delete(handlers);
    };
  }

  /** Clears per-frame state; requires proof of an active frame. */
  endFrame(token: FrameToken): void {
    if (!token) return;

    this.#pressed.clear();
    this.wheelDelta = 0;
  }

  attach(target: HTMLElement): AttachedHandle {
    this.#unbind();

    this.#bounds = () => target.getBoundingClientRect();

    for (const [type, handler, opts] of this.#targetBindings) {
      this.#cancelBindings.push(this.#source.on(target, type, handler, opts));
    }

    for (const [type, handler] of this.#windowBindings) {
      this.#cancelBindings.push(this.#source.onWindow(type, handler));
    }

    const handle = {} as AttachedHandle;

    this.#handle = handle;

    return handle;
  }

  detach(handle: AttachedHandle): void {
    if (this.#handle !== handle) return;

    this.#unbind();
  }

  destroy(): void {
    this.#unbind();
    this.#keys.clear();
    this.#pressed.clear();
    this.#subscribers.clear();
  }

  /**
   * Mutates pointer state in place, then #notifyPointer fans out a frozen snapshot. This two-step
   * pattern (mutate → snapshot → dispatch) is the model for all new event types added here.
   */
  #updatePointer(event: PointerEvent): void {
    const rect = this.#bounds();

    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
    this.pointerDelta.x = this.pointer.x - this.#lastPointer.x;
    this.pointerDelta.y = this.pointer.y - this.#lastPointer.y;
    this.#lastPointer = { x: this.pointer.x, y: this.pointer.y };
  }

  #snapshotPointer(): Point2D {
    return Object.freeze({ x: this.pointer.x, y: this.pointer.y });
  }

  #notifyPointer(eventName: PointerEventName, event: PointerEvent): void {
    const handlerName = POINTER_HANDLER_BY_EVENT[eventName];
    const snapshot = this.#snapshotPointer();

    for (const handlers of this.#subscribers) {
      handlers[handlerName]?.(event, snapshot);
    }
  }

  #onPointerMove = (event: PointerEvent): void => {
    this.#updatePointer(event);
    this.#notifyPointer("pointermove", event);
  };

  #onPointerDown = (event: PointerEvent): void => {
    this.#mouseDown = true;
    this.#mouseButtons = event.buttons;
    this.#updatePointer(event);
    this.#notifyPointer("pointerdown", event);
  };

  #onPointerUp = (event: PointerEvent): void => {
    this.#mouseDown = false;
    this.#mouseButtons = event.buttons;
    this.#updatePointer(event);
    this.#notifyPointer("pointerup", event);
  };

  #onPointerCancel = (event: PointerEvent): void => {
    this.#mouseDown = false;
    this.#mouseButtons = 0;
    this.#notifyPointer("pointercancel", event);
  };

  #onWheel = (event: WheelEvent): void => {
    const rect = this.#bounds();

    this.wheelPosition.x = event.clientX - rect.left;
    this.wheelPosition.y = event.clientY - rect.top;

    // Normalize to CSS pixels: lineMode ≈ 16 px/line, pageMode ≈ viewport height.
    const raw = event.deltaY;
    const delta =
      event.deltaMode === 1
        ? raw * LINE_HEIGHT_PX
        : event.deltaMode === 2
          ? raw * this.#bounds().height
          : raw;

    this.wheelDelta += delta;

    const snapshot = Object.freeze({ x: this.wheelPosition.x, y: this.wheelPosition.y });

    for (const handlers of this.#subscribers) {
      handlers.onWheel?.(event, snapshot);
    }
  };

  #onContextMenu = (event: MouseEvent): void => {
    for (const handlers of this.#subscribers) {
      handlers.onContextMenu?.(event);
    }
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    this.#keys.add(event.code);
    this.#pressed.add(event.code);
  };

  #onKeyUp = (event: KeyboardEvent): void => {
    this.#keys.delete(event.code);
  };

  #unbind(): void {
    for (const cancel of this.#cancelBindings) cancel();

    this.#cancelBindings = [];
    this.#handle = null;
  }
}

export function createInputStore(options?: InputStoreOptions): InputStore {
  return new InputStore(options);
}
