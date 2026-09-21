import { useEffect, useRef, useState } from 'react';

import type { StackDisposable } from './stackTypes';

/**
 * Owns a resource for as long as a node is attached: created on attach, disposed on detach/unmount.
 * `create` may change identity every render — only the node drives the lifecycle.
 *
 * The resource is exposed as reactive state, not a ref: consumers' effects simply depend on it, so
 * they re-run when it appears — no timing assumptions about refs being populated.
 */
export function useNodeResource<N extends Element, R extends StackDisposable>(
    create: (node: N) => R,
) {
    const [node, setNode] = useState<N | null>(null);
    const [resource, setResource] = useState<R | null>(null);

    // Latest-create pattern: synced outside render so a new closure never rebuilds the resource.
    const createRef = useRef(create);

    useEffect(() => {
        createRef.current = create;
    });

    useEffect(() => {
        if (!node) return;

        const created = createRef.current(node);

        setResource(created);

        return () => {
            created.dispose();
            setResource(null);
        };
    }, [node]);

    return { ref: setNode, resource };
}
