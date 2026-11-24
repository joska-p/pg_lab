/** Narrow `value` for tests: `toBeDefined` does not narrow the type. Mirrors the core helper. */
export function defined<T>(value: T | undefined, label = 'value'): T {
    if (value === undefined) {
        throw new Error(`Expected ${label} to be defined`);
    }
    return value;
}
