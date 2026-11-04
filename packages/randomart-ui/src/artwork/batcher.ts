export type Schedule = (run: () => void) => void;

/**
 * Collect items pushed during one tick and hand them over together, once.
 *
 * The scheduler is injected so tests can run synchronously and the store does not depend on
 * `requestAnimationFrame`. The queue lives in this closure, never in module globals.
 */
export function createBatcher<T>(
    schedule: Schedule,
    flush: (items: readonly T[]) => void,
): (item: T) => void {
    let pending: T[] = [];

    return (item: T): void => {
        pending.push(item);
        if (pending.length === 1) {
            schedule(() => {
                const batch = pending;
                pending = [];
                flush(batch);
            });
        }
    };
}
