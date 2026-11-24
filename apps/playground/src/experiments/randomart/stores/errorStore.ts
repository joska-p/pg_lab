import { create } from 'zustand';

interface ErrorState {
    readonly actionErrors: readonly Error[];
}

const EMPTY: readonly Error[] = [];

const store = create<ErrorState>(() => ({ actionErrors: EMPTY }));

function toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

/** Stable reference between updates: safe to return directly from a selector. */
export function useActionErrors(): readonly Error[] {
    return store((state) => state.actionErrors);
}

/** Non-reactive read, for commands and tests. */
export function getActionErrors(): readonly Error[] {
    return store.getState().actionErrors;
}

/** Replace the displayed errors with those of one action. An empty batch changes nothing. */
export function reportErrors(errors: readonly unknown[]): void {
    if (errors.length === 0) {
        return;
    }
    store.setState({ actionErrors: errors.map(toError) });
}

export function reportError(error: unknown): void {
    reportErrors([error]);
}

export function clearActionError(): void {
    store.setState({ actionErrors: EMPTY });
}
