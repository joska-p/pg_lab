import { createObservable } from "./observable";
import { createSeconds, type DurationSeconds, type Seconds, type TimeSpeed } from "../core/time";
import type { ClockStore } from "./types";
import type { Clock } from "../core/Clock";

export function createClockStore(clock: Clock): ClockStore {
  const observable = createObservable();

  return {
    clock,
    get time(): Seconds {
      return clock.time;
    },
    get deltaTime(): Seconds {
      return clock.deltaTime;
    },
    get duration(): DurationSeconds | undefined {
      return clock.duration;
    },
    get progress(): number {
      return clock.progress;
    },
    // ── Actions ──
    togglePlay() {
      clock.togglePlay();
      observable.notify();
    },
    play() {
      clock.play();
      observable.notify();
    },
    pause() {
      clock.pause();
      observable.notify();
    },
    reset() {
      clock.reset();
      observable.notify();
    },
    setSpeed(speed: TimeSpeed) {
      clock.setSpeed(speed);
      observable.notify();
    },
    subscribe: (fn: () => void) => observable.subscribe(fn),
    getSnapshot: () => clock.time,
    getIsPlaying: () => clock.isPlaying,
  };
}

const noop = (): void => undefined;
const noopWithArg = (_arg: unknown): void => undefined;

export function createNullClockStore(): ClockStore {
  return {
    clock: null as unknown as Clock,
    time: createSeconds(0),
    deltaTime: createSeconds(0),
    duration: undefined,
    progress: 0,
    togglePlay: noop,
    play: noop,
    pause: noop,
    reset: noop,
    setSpeed: noopWithArg,
    subscribe: () => noop,
    getSnapshot: () => createSeconds(0),
    getIsPlaying: () => false,
  };
}
