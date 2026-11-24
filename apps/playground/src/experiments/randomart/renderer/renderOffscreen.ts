/**
 * One-shot WebGL2 render of a randomart Shadertoy image shader into an `OffscreenCanvas`. It is
 * independent of the displayed canvas, so the output size is free and no `preserveDrawingBuffer` is
 * needed on the live surface.
 */

import { Program } from '@repo/surface/gpu/Program';

export interface OffscreenRenderOptions {
    /** Complete Shadertoy fragment shader produced by randomart-core's `compile`. */
    readonly fragmentShader: string;
    /** Value of `iTime`, in seconds. */
    readonly time: number;
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

    let program: Program | undefined;
    try {
        const limitsParam = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
        const limits: ArrayLike<number> =
            limitsParam instanceof Int32Array || limitsParam instanceof Float32Array
                ? limitsParam
                : [1, 1];
        const side = clampExportSize(options.size, limits);
        canvas.width = side;
        canvas.height = side;
        if (gl.drawingBufferWidth !== side || gl.drawingBufferHeight !== side) {
            throw new Error(
                `PNG export failed: the GPU cannot allocate a ${side}px drawing buffer`,
            );
        }

        program = new Program(gl, options.fragmentShader);
        program.setUniforms({
            iResolution: [side, side, 1],
            iTime: options.time,
        });
        program.render(side, side);

        // `return await` is required: the context must stay alive until the blob exists.
        return await canvas.convertToBlob({ type: 'image/png' });
    } finally {
        program?.destroy();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
}
