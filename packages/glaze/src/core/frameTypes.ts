import type { Milliseconds, NonNegativeSeconds, Seconds } from "./time";

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
