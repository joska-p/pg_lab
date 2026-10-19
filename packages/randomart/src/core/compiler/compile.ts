/**
 * Compile.ts — Orchestration of the GLSL compilation pipeline.
 *
 * Pipeline: lower → emit → buildPreamble → assemble source
 */

import type { Catalog } from '../catalog/index.ts';
import { colorSpaceFunction, RAW_CHANNELS } from '../color/index.ts';
import type { ChannelModel } from '../color/index.ts';
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
 * There is a single color path: whatever the channels' shape, `main` ends with the one conversion
 * of the `(r, g, b)` triplet — `o_color = vec4(<space>(vec3(r, g, b)), 1.0);` — and the preamble
 * carries that space's GLSL. `shareDepth` never reaches the compiler: it shapes the expression, not
 * the emission.
 *
 * @throws If the assembled source exceeds MAX_SOURCE_LENGTH.
 */
export function compile(
    catalog: Catalog,
    expression: Expression,
    options?: CompileOptions,
): CompiledShader {
    const sharing = options?.sharing ?? 'shared';
    const channels: ChannelModel = options?.channels ?? RAW_CHANNELS;

    // ── 1. Lowering ─────────────────────────────────────────────────────────
    const lowerResult = lower(catalog, expression);

    // ── 2. Emission ─────────────────────────────────────────────────────────
    const emitResult = emit(catalog, lowerResult, sharing);

    // ── 3. Preamble ─────────────────────────────────────────────────────────
    const { preambleLines, animated, uniforms } = buildPreamble(
        catalog,
        emitResult.usedDeps,
        channels.space,
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
    // The one color decision: the triplet through the space's conversion (a plain remap for sRGB).
    // The conversion's own `clamp` is boundary assurance, not a correcting transform.
    mainLines.push(
        `  o_color = vec4(${colorSpaceFunction(channels.space)}(vec3(${rText}, ${gText}, ${bText})), 1.0);`,
    );
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
