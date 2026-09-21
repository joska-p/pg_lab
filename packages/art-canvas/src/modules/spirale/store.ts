import { createNullClockStore } from '@repo/glaze/react/clockStore';
import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

interface StoreState {
    gap: number;
    clockStore: ClockStore;
}

const nullClockStore = createNullClockStore();

const store = create<StoreState>(() => ({
    gap: 0.05,
    clockStore: nullClockStore,
}));

export function useGap() {
    return store((s) => s.gap);
}
export function setGap(gap: number) {
    store.setState({ gap });
}

export function useClockStore() {
    return store((s) => s.clockStore);
}
export function setClockStore(clockStore: ClockStore) {
    store.setState({ clockStore });
}
export function useHasClockStore() {
    return store((s) => s.clockStore !== nullClockStore);
}
