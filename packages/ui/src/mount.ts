/**
 * Returns the host element an app mounts into, or throws a clear error when the page forgot it.
 * Keeps every `main.tsx` free of a non-null assertion.
 */
export function requireRoot(id = 'root'): HTMLElement {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Missing #${id} element`);
    }

    return element;
}
