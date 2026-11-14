import { create } from 'zustand';

interface StoreState {
    gap: number;
}

const store = create<StoreState>(() => ({
    gap: 0.05,
}));

export function useGap() {
    return store((s) => s.gap);
}
export function setGap(gap: number) {
    store.setState({ gap });
}
