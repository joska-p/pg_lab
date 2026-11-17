import { ShaderError } from './ShaderError';
import type { CompiledShaderProgram, UniformEntry } from './types';

/**
 * Vertex shader: draws a fullscreen triangle via gl_VertexID (no attributes needed). Passes
 * fragCoord in pixels (Shadertoy convention: 0.5 to resolution-0.5).
 */
export const VERTEX_SHADER_SOURCE = /* glsl */ `
#version 300 es
precision highp float;
uniform vec3 iResolution;
out vec2 fragCoord;
out vec2 vUv;
void main() {
  vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vec2 clip = pos[gl_VertexID];
  gl_Position = vec4(clip, 0.0, 1.0);
  vUv = clip * 0.5 + 0.5;
  fragCoord = vUv * iResolution.xy;
}
`.trim();

/**
 * Wraps a Shadertoy-style `mainImage` shader into a full GLSL 300 es fragment shader. If the shader
 * already contains `void main()`, it is used as-is (with version + preamble injected).
 */
function wrapFragmentShader(source: string): string {
    // Strip existing #version directive (we always inject 300 es)
    const stripped = source.replace(/^\uFEFF/, '').replace(/^\s*#version\s+\d+\s+\w+\s*/m, '');

    const hasMain = /void\s+main\s*\(/.test(stripped);

    if (hasMain) {
        // Legacy path: shader already has a main(); inject preamble but don't wrap.
        const extraDeclarations: string[] = [];
        if (!/\bin\s+vec2\s+fragCoord\b/.test(stripped)) {
            extraDeclarations.push('in vec2 fragCoord;');
        }
        if (!/\bin\s+vec2\s+vUv\b/.test(stripped)) {
            extraDeclarations.push('in vec2 vUv;');
        }
        if (!/\bout\s+vec4\s+\w+\b/.test(stripped)) {
            extraDeclarations.push('out vec4 fragColor;');
        }

        const preamble = [
            'precision highp float;',
            '',
            'uniform vec3 iResolution;',
            'uniform float iTime;',
            'uniform float iTimeDelta;',
            'uniform int iFrame;',
            'uniform vec4 iMouse;',
            '',
            ...extraDeclarations,
        ].join('\n');

        return `#version 300 es\n${preamble}\n\n${stripped}`;
    }

    // Shadertoy path: wrap mainImage into main().
    // Stage output and inputs MUST be declared at file scope for the generated main().
    const preamble = [
        'precision highp float;',
        '',
        'uniform vec3 iResolution;',
        'uniform float iTime;',
        'uniform float iTimeDelta;',
        'uniform int iFrame;',
        'uniform vec4 iMouse;',
        '',
        'in vec2 fragCoord;',
        'in vec2 vUv;',
        'out vec4 fragColor;',
    ].join('\n');

    return `#version 300 es\n${preamble}\n\n${stripped}\n\nvoid main() {\n  mainImage(fragColor, fragCoord);\n}\n`;
}

function withVersionDirective(source: string): string {
    const stripped = source.replace(/^\uFEFF/, '').replace(/^\s*#version\s+\d+\s+\w+\s*/m, '');
    return `#version 300 es\n${stripped}`;
}

/**
 * Compiles one stage. A driver refusal throws `ShaderError`; a failed allocation (lost context,
 * resource exhaustion) throws a plain `Error`.
 */
function compileStage(
    gl: WebGL2RenderingContext,
    type: number,
    stage: 'vertex' | 'fragment',
    source: string,
): WebGLShader {
    const shader = gl.createShader(type);

    if (!shader) {
        throw new Error(`GpuSurface: shader "${stage}" creation failed`);
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = String(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new ShaderError(stage, log);
    }

    return shader;
}

/**
 * Compiles + links a Shadertoy-compatible fragment shader with the fullscreen vertex shader.
 * Automatically injects `#version 300 es`, uniform declarations, and wraps `mainImage` into `main`.
 * Throws `ShaderError` on driver refusal; nothing is left allocated on failure.
 */
export function compileProgram(
    gl: WebGL2RenderingContext,
    fragmentSource: string,
    vertexSource: string = VERTEX_SHADER_SOURCE,
): CompiledShaderProgram {
    const wrappedFragment = wrapFragmentShader(fragmentSource);
    const preparedVertex = withVersionDirective(vertexSource);

    const vertexShader = compileStage(gl, gl.VERTEX_SHADER, 'vertex', preparedVertex);
    let fragmentShader: WebGLShader;

    try {
        fragmentShader = compileStage(gl, gl.FRAGMENT_SHADER, 'fragment', wrappedFragment);
    } catch (error) {
        gl.deleteShader(vertexShader);
        throw error;
    }

    const program = gl.createProgram();

    if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        throw new Error('GpuSurface: shader "link" program creation failed');
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = String(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        throw new ShaderError('link', log);
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    // Collect active uniforms
    const uniforms = new Map<string, UniformEntry>();
    const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    const numUniforms = typeof activeUniforms === 'number' ? activeUniforms : 0;

    for (let i = 0; i < numUniforms; i++) {
        const info = gl.getActiveUniform(program, i);

        if (info) {
            const loc = gl.getUniformLocation(program, info.name);

            if (loc) {
                const baseName = info.name.replace(/\[0\]$/, '');
                uniforms.set(baseName, {
                    location: loc,
                    type: info.type,
                    size: info.size,
                });
            }
        }
    }

    return { program, uniforms };
}
