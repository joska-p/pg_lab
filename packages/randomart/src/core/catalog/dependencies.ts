export type DependencySpec<Id extends string = string> =
    | { readonly kind: 'uniform'; readonly glslType: 'float' }
    | { readonly kind: 'function'; readonly code: string; readonly requires?: readonly Id[] };

/**
 * `T extends Record<string, DependencySpec<keyof T & string>>`: a function can only require ids
 * that are keys of the same registry. Typos in `requires` fail at compile time.
 */
const defineDependencies = <const T extends Record<string, DependencySpec<keyof T & string>>>(
    dependencies: T,
): T => dependencies;

export const DEPENDENCIES = defineDependencies({
    u_phase: { kind: 'uniform', glslType: 'float' },
    ra_fold2: {
        kind: 'function',
        code: 'vec2 ra_fold2(vec2 v) { return abs(mod(v + 3.0, 4.0) - 2.0) - 1.0; }',
    },
});

export type DependencyId = keyof typeof DEPENDENCIES;
