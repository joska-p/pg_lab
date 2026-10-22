import { defineDependencies } from './dependencies';

/** Registry of shader dependencies (uniforms and functions). */
export const dependencies = defineDependencies({
    u_phase: { kind: 'uniform', glslType: 'float' },
    ra_fold2: {
        kind: 'function',
        code: 'vec2 ra_fold2(vec2 v) { return abs(mod(v + 3.0, 4.0) - 2.0) - 1.0; }',
    },
});

/** Opaque key into the dependency registry. Inferred from the registry keys. */
export type DependencyId = keyof typeof dependencies;

/** Type of the dependencies registry (for internal use). */
export type DependenciesRegistry = typeof dependencies;
