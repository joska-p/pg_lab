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

import type { CompiledShaderProgram, UniformEntry } from './types';

function withVersionDirective(source: string): string {
    const stripped = source.replace(/^\uFEFF/, '').replace(/^\s*#version\s+\d+\s+\w+\s*/m, '');

    return `#version 300 es\n${stripped}`;
}

/**
 * Compiles + links a shader pair, auto-injecting `#version 300 es`; throws the driver log on
 * failure.
 */
export function compileProgram(
    gl: WebGL2RenderingContext,
    fragmentSource: string,
    vertexSource: string = FULLSCREEN_TRIANGLE,
): CompiledShaderProgram {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);

    if (!vertexShader) {
        throw new Error('Glaze: shader "vertex" creation failed');
    }

    gl.shaderSource(vertexShader, withVersionDirective(vertexSource));
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(vertexShader);

        gl.deleteShader(vertexShader);
        throw new Error(`Glaze: shader "vertex" compile failed: ${String(log)}`);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!fragmentShader) {
        gl.deleteShader(vertexShader);
        throw new Error('Glaze: shader "fragment" creation failed');
    }

    gl.shaderSource(fragmentShader, withVersionDirective(fragmentSource));
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(fragmentShader);

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        throw new Error(`Glaze: shader "fragment" compile failed: ${String(log)}`);
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
        const log = gl.getProgramInfoLog(program);

        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        throw new Error(`Glaze: shader "link" compile failed: ${String(log)}`);
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
