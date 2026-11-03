import type { RenderKey } from './types';

/**
 * Pure decision of the lazy-render gate. Redraw when nothing has been drawn yet, when the canvas
 * size changed (resizing the backing buffer clears it), or when the phase moved on a shader that
 * actually reads it. A new shader is not handled here: glaze always draws a fresh program once.
 */
export function needsRender(previous: RenderKey | null, next: RenderKey): boolean {
    if (previous === null) {
        return true;
    }

    if (
        previous.width !== next.width ||
        previous.height !== next.height ||
        previous.dpr !== next.dpr
    ) {
        return true;
    }

    return next.animated && previous.phase !== next.phase;
}
