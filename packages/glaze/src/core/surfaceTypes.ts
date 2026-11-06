import type { PositiveNumber } from './brands';
import type { Camera } from './Camera';
import type { Clock } from './Clock';
import type { ClockOptions } from './clockTypes';
import type { FrameLoopOptions } from './frameTypes';

/** Shared base for imperative surface configs (`canvas` is added per surface kind). */
export interface SurfaceBaseConfig {
    camera?: Camera;
    dpr?: PositiveNumber;
    frameLoopOptions?: FrameLoopOptions;
}

/** Clock mixin shared by every surface kind: an explicit instance wins over `clockOptions`. */
export interface ClockMixin {
    clock?: Clock;
    clockOptions?: ClockOptions;
}
