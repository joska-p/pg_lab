import { describe, expect, it } from 'vite-plus/test';

import {
    COLLAPSED_PANEL_SIZE_PX,
    COLLAPSE_BELOW_PX,
    EXPANDED_PANEL_SIZE_PX,
    MAX_PANEL_SIZE_PX,
    createPanelChromeState,
    isPanelChromeCollapsed,
    panelChromeRenderedSize,
    resizePanelChrome,
    togglePanelChrome,
} from './panelChrome';

describe('createPanelChromeState', () => {
    it('starts expanded at the default size', () => {
        const state = createPanelChromeState();

        expect(state.sizePx).toBe(EXPANDED_PANEL_SIZE_PX);
        expect(state.expandedSizePx).toBe(EXPANDED_PANEL_SIZE_PX);
        expect(isPanelChromeCollapsed(state)).toBe(false);
        expect(panelChromeRenderedSize(state)).toBe(EXPANDED_PANEL_SIZE_PX);
    });
});

describe('resizePanelChrome', () => {
    it('clamps the size at both bounds', () => {
        const state = createPanelChromeState();

        expect(resizePanelChrome(state, 1000).sizePx).toBe(MAX_PANEL_SIZE_PX);
        expect(resizePanelChrome(state, -1000).sizePx).toBe(0);
    });

    it('derives collapse from the threshold, not from a stored boolean', () => {
        const collapsed = resizePanelChrome(createPanelChromeState(), -296);
        const expanded = resizePanelChrome(createPanelChromeState(), -295);

        expect(collapsed.sizePx).toBe(COLLAPSE_BELOW_PX);
        expect(isPanelChromeCollapsed(collapsed)).toBe(true);
        expect(panelChromeRenderedSize(collapsed)).toBe(COLLAPSED_PANEL_SIZE_PX);

        expect(expanded.sizePx).toBe(COLLAPSE_BELOW_PX + 1);
        expect(isPanelChromeCollapsed(expanded)).toBe(false);
        expect(panelChromeRenderedSize(expanded)).toBe(COLLAPSE_BELOW_PX + 1);
    });

    it('restores the last expanded size after collapsing', () => {
        const resized = resizePanelChrome(createPanelChromeState(), -200);
        const collapsed = resizePanelChrome(resized, -200);
        const restored = togglePanelChrome(collapsed);

        expect(resized.sizePx).toBe(120);
        expect(isPanelChromeCollapsed(collapsed)).toBe(true);
        expect(panelChromeRenderedSize(collapsed)).toBe(COLLAPSED_PANEL_SIZE_PX);
        expect(restored.sizePx).toBe(120);
        expect(isPanelChromeCollapsed(restored)).toBe(false);
        expect(panelChromeRenderedSize(restored)).toBe(120);
    });

    it('produces the same numbers for horizontal and vertical drags', () => {
        const horizontal = [-4, -12, -40].reduce(resizePanelChrome, createPanelChromeState());
        const vertical = [-4, -12, -40].reduce(resizePanelChrome, createPanelChromeState());

        expect(horizontal).toEqual(vertical);
        expect(horizontal.sizePx).toBe(EXPANDED_PANEL_SIZE_PX - 56);
    });
});

describe('togglePanelChrome', () => {
    it('survives repeated toggles without losing the remembered size', () => {
        const collapsed = togglePanelChrome(createPanelChromeState());
        const restored = togglePanelChrome(collapsed);

        expect(collapsed.sizePx).toBe(COLLAPSED_PANEL_SIZE_PX);
        expect(collapsed.expandedSizePx).toBe(EXPANDED_PANEL_SIZE_PX);
        expect(restored).toEqual(createPanelChromeState());
        expect(togglePanelChrome(restored)).toEqual(collapsed);
        expect(togglePanelChrome(collapsed)).toEqual(restored);
    });
});
