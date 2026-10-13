import { ShaderError } from './ShaderError';
import type { CompiledShaderProgram, UniformEntry } from './types';

/** Default vertex shader: three vertices rasterizing the whole viewport, with `vUv` in 0..1. */
export const FULLSCREEN_TRIANGLE = /* glsl */ `
  #version 300 es
  precision highp float;
  out vec2 vUv;
  void main() {
    vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
    vUv = pos[gl_VertexID] * 0.5 + 0.5;
    gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
  }
`.trim();

function withVersionDirective(source: string): string {
    const stripped = source.replace(/^\uFEFF/, '').replace(/^\s*#version\s+\d+\s+\w+\s*/m, '');

    return `#version 300 es\n${stripped}`;
}

/**
 * Compiles one stage. A driver refusal throws `ShaderError`; a failed allocation (lost context,
 * resource exhaustion) throws a plain `Error`, because it is not the shader's fault.
 */
function compileStage(
    gl: WebGL2RenderingContext,
    type: number,
    stage: 'vertex' | 'fragment',
    source: string,
): WebGLShader {
    const shader = gl.createShader(type);

    if (!shader) {
        throw new Error(`Glaze: shader "${stage}" creation failed`);
    }

    gl.shaderSource(shader, withVersionDirective(source));
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = String(gl.getShaderInfoLog(shader));

        gl.deleteShader(shader);
        throw new ShaderError(stage, log);
    }

    return shader;
}

/**
 * Compiles + links a shader pair, auto-injecting `#version 300 es`. Throws `ShaderError` (with the
 * driver log) when the driver refuses the shader; nothing is left allocated on failure.
 */
export function compileProgram(
    gl: WebGL2RenderingContext,
    fragmentSource: string,
    vertexSource: string = FULLSCREEN_TRIANGLE,
): CompiledShaderProgram {
    const vertexShader = compileStage(gl, gl.VERTEX_SHADER, 'vertex', vertexSource);
    let fragmentShader: WebGLShader;

    try {
        fragmentShader = compileStage(gl, gl.FRAGMENT_SHADER, 'fragment', fragmentSource);
    } catch (error) {
        gl.deleteShader(vertexShader);
        throw error;
    }

    const program = gl.createProgram();

    if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        throw new Error('Glaze: shader "link" program creation failed');
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

    const uniforms = new Map<string, UniformEntry>();
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;

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
