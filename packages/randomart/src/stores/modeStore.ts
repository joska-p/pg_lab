import { create } from 'zustand';

import type { AppMode } from './types';

interface ModeState {
    mode: AppMode;
}

/**
 * The app's own mode. It lives in the app package — not in Lab or Bench — so `Scene` and `Controls`
 * can be mounted independently (the playground imports each module on its own) while still sharing
 * which face of randomart is active.
 */
const store = create<ModeState>(() => ({
    mode: 'toy',
}));

export function useMode(): AppMode {
    return store((state) => state.mode);
}

export function setMode(mode: AppMode): void {
    store.setState({ mode });
}
