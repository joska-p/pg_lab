import { create } from 'zustand';

export type InputMode = 'spirale' | 'seed' | 'folded-space' | 'atlas' | 'manual';

interface UiStoreState {
    inputMode: InputMode;
}

const uiStore = create<UiStoreState>(() => ({
    inputMode: 'spirale',
}));

export function useInputMode() {
    return uiStore((state) => state.inputMode);
}

export function setInputMode(inputMode: InputMode) {
    uiStore.setState({ inputMode });
}
