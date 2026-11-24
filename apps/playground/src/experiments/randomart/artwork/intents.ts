import type { Draft } from './artwork';

/**
 * A deferred change. Intents receive the draft produced by the previous intent of the same frame,
 * so two edits queued in the same tick compose instead of overwriting each other.
 *
 * Producers are resolved before any expensive work happens: the caller folds a whole frame's worth
 * of intents, then generates and compiles once.
 */
export type Intent = (draft: Draft) => Draft;

export interface Resolved {
    /** Null when the frame contained no intent. */
    readonly draft: Draft | null;
    readonly errors: readonly unknown[];
}

/** Fold intents sequentially. A failing producer is reported and skipped, not fatal. */
export function resolveIntents(current: Draft, intents: readonly Intent[]): Resolved {
    let draft = current;
    let touched = false;
    const errors: unknown[] = [];

    for (const intent of intents) {
        try {
            draft = intent(draft);
            touched = true;
        } catch (error) {
            errors.push(error);
        }
    }

    return { draft: touched ? draft : null, errors };
}
