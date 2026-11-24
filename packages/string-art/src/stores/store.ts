import { create } from 'zustand';

interface StoreState {
    source: ImageData | null;
    output: ImageData | null;
}

const store = create<StoreState>(() => ({
    source: null,
    output: null,
}));

export function useSource(): ImageData | null {
    return store((state) => state.source);
}

export function useOutput(): ImageData | null {
    return store((state) => state.output);
}

export function setSource(data: ImageData): void {
    store.setState({ source: data });
}

export function setOutput(data: ImageData): void {
    store.setState({ output: data });
}
