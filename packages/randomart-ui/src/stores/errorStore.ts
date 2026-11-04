import { create } from 'zustand';

interface ErrorState {
    readonly actionError: Error | null;
}

const store = create<ErrorState>(() => ({ actionError: null }));

export function useActionError(): string | null {
    return store((state) => state.actionError?.message ?? null);
}

export function reportError(error: unknown): void {
    store.setState({ actionError: error instanceof Error ? error : new Error(String(error)) });
}

export function clearActionError(): void {
    store.setState({ actionError: null });
}
