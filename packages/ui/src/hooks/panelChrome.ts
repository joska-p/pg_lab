/**
 * Pure panel chrome state. Sizes are CSS pixels and do not depend on screen orientation: the shell
 * decides which axis to apply them to.
 */
export const MIN_PANEL_SIZE_PX = 0;
export const COLLAPSED_PANEL_SIZE_PX = 16;
export const COLLAPSE_BELOW_PX = COLLAPSED_PANEL_SIZE_PX * 1.5;
export const EXPANDED_PANEL_SIZE_PX = 320;
export const MAX_PANEL_SIZE_PX = 640;

export interface PanelChromeState {
    /** Continuous target size; the rendered size is derived from it. */
    readonly sizePx: number;
    /** Last size above the collapse threshold, used when restoring. */
    readonly expandedSizePx: number;
}

export function createPanelChromeState(): PanelChromeState {
    return { sizePx: EXPANDED_PANEL_SIZE_PX, expandedSizePx: EXPANDED_PANEL_SIZE_PX };
}

export function isPanelChromeCollapsed(state: PanelChromeState): boolean {
    return state.sizePx <= COLLAPSE_BELOW_PX;
}

export function panelChromeRenderedSize(state: PanelChromeState): number {
    return isPanelChromeCollapsed(state) ? COLLAPSED_PANEL_SIZE_PX : state.sizePx;
}

export function resizePanelChrome(state: PanelChromeState, deltaPx: number): PanelChromeState {
    if (!Number.isFinite(deltaPx)) {
        return state;
    }

    const sizePx = Math.min(MAX_PANEL_SIZE_PX, Math.max(MIN_PANEL_SIZE_PX, state.sizePx + deltaPx));

    if (sizePx === state.sizePx) {
        return state;
    }

    return {
        sizePx,
        expandedSizePx: sizePx > COLLAPSE_BELOW_PX ? sizePx : state.expandedSizePx,
    };
}

export function togglePanelChrome(state: PanelChromeState): PanelChromeState {
    return isPanelChromeCollapsed(state)
        ? { sizePx: state.expandedSizePx, expandedSizePx: state.expandedSizePx }
        : { sizePx: COLLAPSED_PANEL_SIZE_PX, expandedSizePx: state.sizePx };
}
