import type { Notify, Observable, Unsubscribe } from './types';

export function createObservable(): Observable {
    const listeners = new Set<Notify>();

    return {
        notify() {
            listeners.forEach((fn) => {
                fn();
            });
        },
        subscribe(fn: Notify): Unsubscribe {
            listeners.add(fn);

            return () => listeners.delete(fn);
        },
    };
}
