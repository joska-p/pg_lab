import { createContext, createElement, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import {
    createPanelChromeState,
    isPanelChromeCollapsed,
    panelChromeRenderedSize,
    resizePanelChrome,
    togglePanelChrome,
} from './panelChrome';

export interface PanelChrome {
    readonly collapsed: boolean;
    readonly sizePx: number;
    resize(this: void, deltaPx: number): void;
    toggle(this: void): void;
}

const PanelChromeContext = createContext<PanelChrome | null>(null);

interface PanelChromeProviderProps {
    readonly children: ReactNode;
}

export function PanelChromeProvider({ children }: PanelChromeProviderProps) {
    const [state, setState] = useState(createPanelChromeState);

    const chrome: PanelChrome = {
        collapsed: isPanelChromeCollapsed(state),
        sizePx: panelChromeRenderedSize(state),
        resize: (deltaPx) => setState((current) => resizePanelChrome(current, deltaPx)),
        toggle: () => setState(togglePanelChrome),
    };

    return createElement(PanelChromeContext.Provider, { value: chrome }, children);
}

export function usePanelChrome(): PanelChrome {
    const chrome = useContext(PanelChromeContext);

    if (chrome === null) {
        throw new Error('usePanelChrome requires a ShellWrapper ancestor');
    }

    return chrome;
}
