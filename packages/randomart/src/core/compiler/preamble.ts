/**
 * Preamble.ts — GLSL preamble builder (spec §5.4).
 *
 * Builds the preamble (precision, uniforms, PI constant, functions) and the main() header/footer,
 * preserving the renderer contract: `in vec2 vUv` + `vec2 v_p = vUv * 2.0 - 1.0;` in main().
 *
 * NOTE: The spec §5.4 mentions `in vec2 v_p` directly, but the randomart renderer contract
 * (established in S3/S4) uses `in vec2 vUv` + coordinate conversion inside main. We preserve that
 * contract here.
 */

import type { Catalog, ShaderDependency } from '../catalog/index.ts';

export interface PreambleResult {
    /** Lines that go before void main(). */
    readonly preambleLines: readonly string[];
    /** Whether u_phase is required (animated). */
    readonly animated: boolean;
    /** Uniforms to include in CompiledShader.uniforms. */
    readonly uniforms: readonly { name: string; glslType: 'float' }[];
}

/**
 * Builds the preamble lines from the set of used dependency names. Order: precision → blank →
 * vUv/o_color → blank → u_phase → extra uniforms → blank → PI → blank → functions
 */
export function buildPreamble(catalog: Catalog, usedDeps: ReadonlySet<string>): PreambleResult {
    const deps: readonly ShaderDependency[] = catalog.dependencyClosure([...usedDeps]);

    const uniformDeps = deps.filter(
        (d): d is Extract<ShaderDependency, { kind: 'uniform' }> => d.kind === 'uniform',
    );
    const functionDeps = deps.filter(
        (d): d is Extract<ShaderDependency, { kind: 'function' }> => d.kind === 'function',
    );

    const animated = uniformDeps.some((d) => d.name === 'u_phase');

    // u_phase is always declared (renderer contract)
    const extraUniforms = uniformDeps.filter((d) => d.name !== 'u_phase');

    const lines: string[] = [
        'precision highp float;',
        '',
        'in vec2 vUv;',
        'out vec4 o_color;',
        '',
        'uniform float u_phase;',
    ];

    for (const u of extraUniforms) {
        lines.push(`uniform ${u.glslType} ${u.name};`);
    }

    lines.push('', 'const float PI = 3.141592653589793;');

    if (functionDeps.length > 0) {
        lines.push('');
        for (const fn of functionDeps) {
            lines.push(fn.code);
        }
    }

    // All uniforms (including u_phase) for CompiledShader.uniforms
    const uniforms = uniformDeps.map((d) => ({ name: d.name, glslType: d.glslType }));

    // u_phase is always in uniforms if it's in the dep closure; but renderer contract requires
    // it always be declared. Add it to uniforms only if it actually appears in the closure.
    // (The naïve compiler always reported it in uniforms when animated=true.)

    return {
        preambleLines: Object.freeze(lines),
        animated,
        uniforms: Object.freeze(uniforms),
    };
}
