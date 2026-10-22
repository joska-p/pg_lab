import type { Catalog } from '../catalog/types';
import { colorSpaceFunction } from '../color/color';
import { nodeCount } from '../expression/expression';
import type { Expression } from '../expression/types';
import { RAW_CHANNELS } from '../grammar/constants';
import type { ChannelModel } from '../grammar/types';
import { GLSL_COORD_INIT } from './contract';
import { emit } from './emit';
import { lower } from './lower';
import { buildPreamble } from './preamble';
import { MAX_SOURCE_LENGTH } from './types';
import type { CompiledShader, CompileOptions } from './types';

/**
 * Compiles an Expression into a GLSL ES 3.00 fragment shader respecting the renderer contract:
 *
 * - `in vec2 vUv;` UV input
 * - `vec2 v_p = vUv * 2.0 - 1.0;` in main()
 * - `out vec4 o_color;` color output
 * - `uniform float u_phase;` always declared
 *
 * Single color path: `main` ends with one `(r,g,b)` triplet conversion via the space's GLSL.
 * `shareDepth` shapes the expression, not the emission.
 *
 * @throws If source exceeds MAX_SOURCE_LENGTH.
 */
export function compile(
    catalog: Catalog,
    expression: Expression,
    options?: CompileOptions,
): CompiledShader {
    const sharing = options?.sharing ?? 'shared';
    const channels: ChannelModel = options?.channels ?? RAW_CHANNELS;

    const lowerResult = lower(catalog, expression);
    const emitResult = emit(catalog, lowerResult, sharing);
    const { preambleLines, animated, uniforms } = buildPreamble(
        catalog,
        emitResult.usedDeps,
        channels.space,
    );

    const [rText, gText, bText] = emitResult.channelTexts;

    const mainLines: string[] = ['void main() {', `  ${GLSL_COORD_INIT}`];

    if (emitResult.lines.length > 0) {
        mainLines.push('');
        for (const line of emitResult.lines) {
            mainLines.push(line);
        }
    }

    mainLines.push('');
    // Single color path: triplet through space conversion (clamp = boundary assurance).
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
