import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

interface SelectionStore {
    baseUrl: string;
    selectedDrawingId: number | null;
    scrollTargetId: number | null;
}

const selectionStore = createStore<SelectionStore>(() => ({
    baseUrl: '/',
    selectedDrawingId: null,
    scrollTargetId: null,
}));

/* Getters */

export function useBaseUrl(): string {
    return useStore(selectionStore, (state) => state.baseUrl);
}

export function useSelectedDrawingId(): number | null {
    return useStore(selectionStore, (state) => state.selectedDrawingId);
}

export function useScrollTargetId(): number | null {
    return useStore(selectionStore, (state) => state.scrollTargetId);
}

/* Setters */

export function setBaseUrl(baseUrl: string): void {
    selectionStore.setState({ baseUrl });
}

export function setSelectedDrawingId(id: number | null): void {
    selectionStore.setState({ selectedDrawingId: id });
}

export function setScrollTarget(id: number): void {
    selectionStore.setState({ scrollTargetId: id, selectedDrawingId: id });
}

export function clearScrollTarget(): void {
    selectionStore.setState({ scrollTargetId: null });
}

export { selectionStore };
