import type { Brand } from '@repo/glaze/core/brands';

/**
 * Single source for the `Brand` type (findings F01/F02): glaze owns the definition, randomart
 * re-exports it. TypeScript distinguishes brands only by their string literal — never by package —
 * so brand literals are agreed across glaze and randomart and each concept owns exactly one. Glaze
 * owns `CanvasDimension`, `DevicePixelRatio`, `DurationSeconds`, `ZoomFactor`…; randomart owns
 * `Phase`, `Constraints`, `RenderSettings`, `Seed`, `Expression`, `Node`, `Grammar`, `Artwork`. No
 * literal exists in both.
 */
export type { Brand };

/**
 * Error-message convention (findings F03/F05): every validation message thrown from this package's
 * asserts and `create*` factories is prefixed `Randomart:` (mirroring glaze's `Glaze:`), and the
 * label argument is a dotted field path (`render.loopMs`, `constraints.minDepth`) — the shortest
 * string that tells the caller which value is guilty. Labels may carry an index (`weight of item at
 * index 3`) when the field has no name.
 */

export function assertFinite(value: number, label: string): void {
    if (!Number.isFinite(value)) {
        throw new Error(`Randomart: ${label} must be a finite number, received ${String(value)}`);
    }
}

/** Exists for symmetry with glaze's helper (findings F01): same contract, `Randomart:` prefix. */
export function assertStrictlyPositive(value: number, label: string): void {
    assertFinite(value, label);

    if (value <= 0) {
        throw new Error(`Randomart: ${label} must be strictly positive, received ${String(value)}`);
    }
}

export function assertInteger(value: number, label: string): void {
    assertFinite(value, label);

    if (!Number.isInteger(value)) {
        throw new Error(`Randomart: ${label} must be an integer, received ${String(value)}`);
    }
}

export function assertIntegerInRange(value: number, label: string, min: number, max: number): void {
    assertInteger(value, label);

    if (value < min || value > max) {
        throw new Error(
            `Randomart: ${label} must be an integer in [${min}, ${max}], received ${String(value)}`,
        );
    }
}
