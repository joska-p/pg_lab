/**
 * Compile.ts — Orchestration of the GLSL compilation pipeline.
 *
 * Pipeline: lower → emit → buildPreamble → assemble source
 */

import type { Catalog } from '../catalog/index.ts';
import { paletteGlsl, UNRELATED_COLOR } from '../color/index.ts';
import type { ColorModel } from '../color/index.ts';
import { nodeCount } from '../expression/index.ts';
import type { Expression } from '../expression/index.ts';
import { emit } from './emit.ts';
import { lower } from './lower.ts';
import { buildPreamble } from './preamble.ts';
import { MAX_SOURCE_LENGTH } from './types.ts';
import type { CompiledShader, CompileOptions } from './types.ts';

/**
 * Compiles a randomart Expression into a complete GLSL ES 3.00 fragment shader.
 *
 * The output respects the renderer contract:
 *
 * - `in vec2 vUv;` as UV input (not `in vec2 v_p` directly)
 * - `vec2 v_p = vUv * 2.0 - 1.0;` at the start of main()
 * - `out vec4 o_color;` as color output
 * - `uniform float u_phase;` always declared
 *
 * In `correlated` colour mode the three roots are one field (the generator reuses the same node)
 * and the final colour is a palette sampled at that field; in `unrelated` mode (default) the three
 * channels are written to RGB directly.
 *
 * @throws If the assembled source exceeds MAX_SOURCE_LENGTH.
 */
export function compile(
    catalog: Catalog,
    expression: Expression,
    options?: CompileOptions,
): CompiledShader {
    const sharing = options?.sharing ?? 'shared';
    const color: ColorModel = options?.color ?? UNRELATED_COLOR;

    // ── 1. Lowering ─────────────────────────────────────────────────────────
    const lowerResult = lower(catalog, expression);

    // ── 2. Emission ─────────────────────────────────────────────────────────
    const emitResult = emit(catalog, lowerResult, sharing);

    // ── 3. Preamble ─────────────────────────────────────────────────────────
    const extraFunctions = color.kind === 'correlated' ? [paletteGlsl(color.palette)] : [];
    const { preambleLines, animated, uniforms } = buildPreamble(
        catalog,
        emitResult.usedDeps,
        extraFunctions,
    );

    // ── 4. Assemble source ───────────────────────────────────────────────────
    const [rText, gText, bText] = emitResult.channelTexts;

    const mainLines: string[] = ['void main() {', '  vec2 v_p = vUv * 2.0 - 1.0;'];

    if (emitResult.lines.length > 0) {
        mainLines.push('');
        for (const line of emitResult.lines) {
            mainLines.push(line);
        }
    }

    mainLines.push('');

    if (color.kind === 'correlated') {
        // The three roots are the same field; the palette is the only place colour is decided.
        // The `clamp` is provably dead: every catalog operator preserves `[-1, 1]` when its inputs
        // do (`x`/`y`/`tsin`/`tcos`/`const` are in range, `add` averages, `mul`/`div`/`sqr`/`abs`/
        // `min`/`max`/`mix`/`sin`/`cos`/`gt`/`select`/`warp` and `ra_fold2` stay in range), so
        // `field * 0.5 + 0.5` is already in `[0, 1]`. Kept as cheap boundary assurance (the
        // compiler takes any catalog), not as a correcting transform.
        mainLines.push(`  float t = clamp(${rText} * 0.5 + 0.5, 0.0, 1.0);`);
        mainLines.push('  o_color = vec4(ra_pal(t), 1.0);');
    } else {
        // Same dead `clamp` argument as above, for the legacy three-channel model.
        mainLines.push(`  vec3 rgb = vec3(${rText}, ${gText}, ${bText});`);
        mainLines.push('  o_color = vec4(clamp(rgb * 0.5 + 0.5, 0.0, 1.0), 1.0);');
    }

    mainLines.push('}');

    const source = [...preambleLines, '', ...mainLines].join('\n');

    if (source.length > MAX_SOURCE_LENGTH) {
        throw new Error(
            `Shader source length (${source.length}) exceeds MAX_SOURCE_LENGTH (${MAX_SOURCE_LENGTH})`,
        );
    }

    // ── 5. Stats ─────────────────────────────────────────────────────────────
    const totalNodes = nodeCount(expression);

    return {
        source,
        uniforms,
        animated,
        stats: {
            nodes: totalNodes,
            vertices: lowerResult.vertices.length,
            variables: emitResult.varCount,
            contexts: 1 + lowerResult.contexts.length,
            sourceLength: source.length,
        },
    };
}
