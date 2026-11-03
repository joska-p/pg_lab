import { create } from 'zustand';

export type AppMode = 'toy' | 'lab';

interface ModeState {
    mode: AppMode;
}

const store = create<ModeState>(() => ({
    mode: 'toy',
}));

export function useMode(): AppMode {
    return store((state) => state.mode);
}

export function setMode(mode: AppMode): void {
    store.setState({ mode });
}
