/**
 * Preamble.ts — GLSL preamble builder.
 *
 * Builds the preamble (precision, uniforms, PI constant, dependency functions) and the `main()`
 * header/footer. It preserves the renderer contract: the fragment shader reads `in vec2 vUv` and
 * derives `vec2 v_p = vUv * 2.0 - 1.0;` inside `main()`, rather than receiving `in vec2 v_p`.
 */

import type { Catalog, ShaderDependency } from '../catalog/Catalog';
import { colorSpaceGlsl } from '../color/color';
import type { ColorSpaceId } from '../config/types';
import { GLSL_IN_UV, GLSL_OUT_COLOR } from './contract';

export interface PreambleResult {
    /** Lines that go before void main(). */
    readonly preambleLines: readonly string[];
    /** Whether the shader reads `u_phase`, derived from the dependency closure alone. */
    readonly animated: boolean;
    /** Uniforms to include in CompiledShader.uniforms. */
    readonly uniforms: readonly { name: string; glslType: 'float' }[];
}

/**
 * Builds the preamble lines from the set of used dependency names, plus the color space's
 * conversion function. Order: precision → blank → vUv/o_color → blank → u_phase → extra uniforms →
 * blank → PI → blank → dependency functions → blank → color space function.
 */
export function buildPreamble(
    catalog: Catalog,
    usedDeps: ReadonlySet<string>,
    colorSpace: ColorSpaceId = 'srgb',
): PreambleResult {
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
        GLSL_IN_UV,
        GLSL_OUT_COLOR,
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

    lines.push('', colorSpaceGlsl(colorSpace));

    // Uniforms reported to the renderer: exactly those in the dependency closure. `u_phase` is
    // declared in every shader (renderer contract) but only listed here when an animated operator
    // actually requires it, so `uniforms` stays a faithful description of what is read.
    const uniforms = uniformDeps.map((d) => ({ name: d.name, glslType: d.glslType }));

    return {
        preambleLines: Object.freeze(lines),
        animated,
        uniforms: Object.freeze(uniforms),
    };
}
