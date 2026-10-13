interface Destroyable {
    destroy(): void;
}

type SwapResult<P, E> = { ok: true; program: P } | { ok: false; error: E };

/**
 * Applies the outcome of a compilation to the slot holding the live program. Success: the new
 * program takes over, then the old one is destroyed (never before, so there is no gap). Failure:
 * the live program is kept untouched and the error is returned. Returns `null` on success.
 */
export function swapProgram<P extends Destroyable, E>(
    holder: { current: P | null },
    result: SwapResult<P, E>,
): E | null {
    if (!result.ok) {
        return result.error;
    }

    const previous = holder.current;

    holder.current = result.program;
    previous?.destroy();

    return null;
}
