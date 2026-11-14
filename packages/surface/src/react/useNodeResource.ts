import { useEffect, useState } from 'react';

import { useLatest } from './useLatest';

/** Minimal interface a resource must implement. */
export interface NodeDisposable {
    dispose(): void;
}

/**
 * Creates a resource when a DOM node appears on screen, and destroys it when it disappears.
 *
 * - `create`: factory called with the DOM node. It may change identity freely — only the node
 *   mounting/unmounting triggers creation/destruction.
 *
 * Returns:
 *
 * - `ref`: attach to the element (`<canvas ref={ref} />`).
 * - `resource`: the resource, or `null` while not ready.
 *
 * The resource is state (not a ref): effects that depend on it re-run automatically when it becomes
 * available, without needing to guess the initialisation order.
 */
export function useNodeResource<N extends Element, R extends NodeDisposable>(
    create: (node: N) => R,
) {
    // The DOM node (null while not mounted).
    const [node, setNode] = useState<N | null>(null);

    // The resource created from that node (null while not ready).
    const [resource, setResource] = useState<R | null>(null);

    // Keep the latest `create` without making the effect re-run on every render.
    const createRef = useLatest(create);

    useEffect(() => {
        if (!node) {
            return;
        }

        const created = createRef.current(node);
        setResource(created);

        return () => {
            created.dispose();
            setResource(null);
        };
    }, [node, createRef]);

    return { ref: setNode, resource };
}
