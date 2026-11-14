import { useLayoutEffect, useRef } from 'react';

/**
 * Keeps a ref always pointing at the latest version of `value`. Useful when an effect needs the
 * most recent callback without re-running on every render.
 */
export function useLatest<T>(value: T) {
    const ref = useRef(value);

    useLayoutEffect(() => {
        ref.current = value;
    });

    return ref;
}
