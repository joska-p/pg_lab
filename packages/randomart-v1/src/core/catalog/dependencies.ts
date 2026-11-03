// Naming: uniforms are `u_*`, helper functions are `ra_*`, no `__`. Names reserved by the
// compiler: `v<n>`, `c<n>`, `v_p`, `o_color`, `PI`, `main`.

import type { DependencySpec } from './types';

/**
 * Creates a typed dependency registry. A function can only require ids that are keys of the same
 * registry. Typos in `requires` fail at compile time.
 */
export const defineDependencies = <
    const T extends Record<string, DependencySpec<keyof T & string>>,
>(
    dependencies: T,
): T => dependencies;
