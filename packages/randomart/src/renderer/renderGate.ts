import type { CanvasDimension, DevicePixelRatio } from '@repo/glaze/core/render';

import type { Phase } from './contract.ts';

/**
 * What the last drawn frame depended on. Every field is a validated brand: the phase in [0, 1)
 * comes from `createPhase`, the CSS dimensions from `createCanvasDimension` (glaze) and the DPR is
 * carried from the surface untouched instead of being widened back to `number`.
 */
export interface RenderKey {
    readonly phase: Phase;
    readonly width: CanvasDimension;
    readonly height: CanvasDimension;
    readonly dpr: DevicePixelRatio;
    /** True when the shader reads `u_phase`, so a phase change alters the picture. */
    readonly animated: boolean;
}

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
