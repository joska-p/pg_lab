import type { ApplyCodeContext, Behavior } from './behaviors/registry';
import { CHANNELS } from './color';
import { getColorSpaceGlslFunction, wrapWithColorSpaceConversion } from './glsl-color-spaces';
import type { ColorSpaceId } from './glsl-color-spaces';
import { resolveGlslDeps } from './glsl-library';
import { getOperator } from './grammar/operators/registry';
import { seededShuffle } from './prng';
import { toGLSL } from './tree';
import type { ChannelTrees, Node } from './tree';

interface BuildShaderPreambleProps {
    noiseIds: string[];
    behaviors: Behavior[];
}

function buildShaderPreamble({ noiseIds, behaviors }: BuildShaderPreambleProps): string {
    const noiseFunctions = resolveGlslDeps(noiseIds);
    const seen = new Set<string>();
    const behaviorFunctions = behaviors
        .filter((behavior) => {
            if (seen.has(behavior.id)) {
                return false;
            }

            seen.add(behavior.id);

            return true;
        })
        .map((behavior) => behavior.glslFunction ?? '')
        .filter((fn) => fn.length > 0)
        .join('\n');

    return (noiseFunctions ? noiseFunctions + '\n\n' : '') + behaviorFunctions;
}

/** @internal */
export interface CollectNoiseDependenciesProps {
    node: Node;
    deps: Set<string>;
}

function collectNoiseDependencies({ node, deps }: CollectNoiseDependenciesProps): void {
    const operator = getOperator(node.type);

    if (operator.noiseDependencies) {
        for (const id of operator.noiseDependencies) {
            deps.add(id);
        }
    }

    for (const name of operator.argNames) {
        const child = node.args[name];

        if (child && typeof child !== 'number') {
            collectNoiseDependencies({ node: child, deps });
        }
    }
}

/** @internal */
export interface ApplyBehaviorsProps {
    behaviors: Behavior[];
    behaviorType: Behavior['kind'];
}

function applyBehaviors({ behaviors, behaviorType }: ApplyBehaviorsProps): string {
    const ctx: ApplyCodeContext = {
        time: 'u_time',
        speed: 'u_animSpeed',
        spatial: 'p',
        color: 'color',
    };

    return behaviors
        .filter((behavior) => behavior.kind === behaviorType)
        .map((behavior) => behavior.applyCode(ctx))
        .join('\n');
}

function compileColorExpression(trees: ChannelTrees): string {
    return `vec3(${CHANNELS.map((channel) => toGLSL(trees[channel], 'p')).join(', ')})`;
}

export interface CompileToShaderProps {
    seedText: string;
    trees: ChannelTrees;
    behaviors?: Behavior[];
    colorSpace?: ColorSpaceId;
}

export function compileToShader({
    seedText,
    trees,
    behaviors = [],
    colorSpace = 'srgb',
}: CompileToShaderProps): string {
    const deterministicBehaviors = seededShuffle(behaviors, `${seedText}_behaviors`);
    const noiseDeps = new Set<string>();
    const colorExpr = compileColorExpression(trees);
    const spatialCode = applyBehaviors({ behaviors, behaviorType: 'spatial' });
    const colorCode = applyBehaviors({ behaviors, behaviorType: 'color' });
    const colorSpaceGlsl = getColorSpaceGlslFunction(colorSpace);

    // TODO: make collectNoiseDependencies return a set of noise dependencies instead of mutating it
    for (const channel of CHANNELS) {
        collectNoiseDependencies({ node: trees[channel], deps: noiseDeps });
    }

    for (const behavior of deterministicBehaviors) {
        for (const id of behavior.noiseDependencies ?? []) {
            noiseDeps.add(id);
        }
    }

    return `#version 300 es
precision highp float;

uniform float u_time;
uniform float u_animSpeed;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

in vec2 v_texCoord;

out vec4 fragColor;

${buildShaderPreamble({ noiseIds: [...noiseDeps], behaviors })}
${colorSpaceGlsl ? `${colorSpaceGlsl}\n` : ''}
void main() {
  vec2 p = v_texCoord * 2.0 - 1.0;
  p.y = -p.y;

  float t_time = u_time;
  float t_speed = u_animSpeed;
  ${spatialCode}

${wrapWithColorSpaceConversion(colorExpr, colorSpace)}

  ${colorCode}

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
}
