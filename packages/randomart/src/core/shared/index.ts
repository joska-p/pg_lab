import type { Brand } from '@repo/glaze/core/brands';

/**
 * Single source for the `Brand` type: glaze owns the definition, randomart re-exports it.
 * TypeScript distinguishes brands only by their string literal — never by package — so brand
 * literals are agreed across glaze and randomart and each concept owns exactly one. Glaze owns
 * `CanvasDimension`, `DevicePixelRatio`, `DurationSeconds`, `ZoomFactor`…; randomart owns `Phase`,
 * `Constraints`, `RenderSettings`, `Seed`, `Expression`, `Node`, `Grammar`, `Artwork`. No literal
 * exists in both.
 */
export type { Brand };

/**
 * Error-message convention: every validation message thrown from this package's asserts and
 * `create*` factories is prefixed `Randomart:` (mirroring glaze's `Glaze:`), and the label argument
 * is a dotted field path (`render.loopMs`, `constraints.minDepth`) — the shortest string that tells
 * the caller which value is guilty. Labels may carry an index (`weight of item at index 3`) when
 * the field has no name.
 */

/**
 * Throw-vs-repair policy (tranche 2026-10-16). The package sorts every bad input into one of two
 * data kinds, and each site documents which one it guards:
 *
 * - **Identity, content, structure, type — repair would invent data:** throw. Stand-ins for "what did
 *   the caller mean" do not exist (which terminal to switch back on, which operator a mistyped name
 *   maps to, which artwork a clamped seed replays). Corruption is refused honestly (UI shows the
 *   error, file import is rejected with the field path).
 * - **Editing quantities with an order (bounds, pairs like `minDepth ≤ maxDepth`) — a canonical
 *   repair exists:** repair, never throw. `fit*` functions clamp/round non-finite values to the
 *   concept's default (a NaN is garbage, not an intent) and are the _only_ entry points for
 *   untrusted sources (UI fields, JSON files). `create*` factories keep their throws: they are the
 *   last detector for callers that vouch for their values (core code, tests) — the glaze
 *   `createZoomBounds` vs `createZoomClamp` split.
 *
 * One categorical exception, sourced from the checklist (§14 Errors): nothing throws on the
 * per-frame path (`createPhase`, render gate) — a bad value there would spam every frame instead of
 * failing once at a configuration boundary.
 */

export function assertFinite(value: number, label: string): void {
    if (!Number.isFinite(value)) {
        throw new Error(`Randomart: ${label} must be a finite number, received ${String(value)}`);
    }
}

/** Exists for symmetry with glaze's helper: same contract, `Randomart:` prefix. */
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
