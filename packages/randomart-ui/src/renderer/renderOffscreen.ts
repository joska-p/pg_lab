/**
 * One-shot WebGL2 render of a randomart fragment shader into an `OffscreenCanvas`. It is
 * independent of the displayed canvas, so the output size is free and no `preserveDrawingBuffer` is
 * needed on the live surface.
 */

/**
 * Fullscreen triangle: `vUv` covers [0, 1]² with (0, 0) at the bottom left, the contract documented
 * by randomart-core and provided by the live renderer.
 */
const VERTEX_SHADER = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vUv = pos[gl_VertexID] * 0.5 + 0.5;
  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}`;

export interface OffscreenRenderOptions {
    /** Complete GLSL ES 3.00 fragment shader produced by randomart-core's `compile`. */
    readonly fragmentShader: string;
    /** Value of `u_phase`, in [0, 1). */
    readonly phase: number;
    /** Requested side of the square output, in pixels. */
    readonly size: number;
}

/** Largest usable square side: the request, capped by every viewport limit, at least 1. */
export function clampExportSize(requested: number, limits: ArrayLike<number>): number {
    let side = requested;

    for (let index = 0; index < limits.length; index++) {
        const limit = limits[index];

        if (limit !== undefined && limit < side) {
            side = limit;
        }
    }

    return Math.max(1, Math.floor(side));
}

function compileShader(
    gl: WebGL2RenderingContext,
    type: number,
    stage: 'vertex' | 'fragment',
    source: string,
): WebGLShader {
    const shader = gl.createShader(type);
    if (shader === null) {
        throw new Error(`PNG export failed: could not create the ${stage} shader`);
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
        const log = gl.getShaderInfoLog(shader) ?? 'no info log';
        gl.deleteShader(shader);
        throw new Error(`PNG export failed: ${stage} shader does not compile: ${log}`);
    }
    return shader;
}

function createProgram(gl: WebGL2RenderingContext, fragmentShader: string): WebGLProgram {
    const program = gl.createProgram();
    if (program === null) {
        throw new Error('PNG export failed: could not create the program');
    }
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, 'vertex', VERTEX_SHADER));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, 'fragment', fragmentShader));
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
        const log = gl.getProgramInfoLog(program) ?? 'no info log';
        throw new Error(`PNG export failed: program does not link: ${log}`);
    }
    return program;
}

/** Render the shader once and encode the result as a PNG. Failures are thrown. */
export async function renderToBlob(options: OffscreenRenderOptions): Promise<Blob> {
    const canvas = new OffscreenCanvas(1, 1);
    // `preserveDrawingBuffer` is safe here: this context lives for one frame.
    const gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: true,
    });
    if (gl === null) {
        throw new Error('PNG export failed: WebGL2 is not available on an OffscreenCanvas');
    }

    try {
        const limits = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
        const side = clampExportSize(options.size, limits);
        canvas.width = side;
        canvas.height = side;
        if (gl.drawingBufferWidth !== side || gl.drawingBufferHeight !== side) {
            throw new Error(
                `PNG export failed: the GPU cannot allocate a ${side}px drawing buffer`,
            );
        }

        const program = createProgram(gl, options.fragmentShader);
        gl.useProgram(program);
        // A uniform optimised out by the compiler has a null location; WebGL ignores it.
        gl.uniform1f(gl.getUniformLocation(program, 'u_phase'), options.phase);
        gl.viewport(0, 0, side, side);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // `return await` is required: the context must stay alive until the blob exists.
        return await canvas.convertToBlob({ type: 'image/png' });
    } finally {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
}
