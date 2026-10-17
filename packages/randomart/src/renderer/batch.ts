import { createDevicePixelRatio } from '@repo/glaze/core/render';
import { createGpuSurface } from '@repo/glaze/gpu/GpuSurface';
import type { GpuSurface } from '@repo/glaze/gpu/GpuSurface';

import type { RgbImage } from '../core/analysis/index.ts';
import type { Catalog } from '../core/catalog/index.ts';
import { compile } from '../core/compiler/index.ts';
import { generate } from '../core/generator/index.ts';
import type { Grammar } from '../core/grammar/index.ts';
import type { Seed } from '../core/random/index.ts';
import { DEFAULT_CONTEXT_OPTIONS } from './contract.ts';

/** Side of one rendered cell, in pixels. Power of two so the analysis descriptors accept it. */
export const DEFAULT_BATCH_SIZE = 32;

export interface BatchRequest {
    readonly grammar: Grammar;
    /** One image per seed: the row of the planche. */
    readonly seeds: readonly Seed[];
}

export interface RenderedCell {
    /** Message of the refusal (generation, compilation, driver), `null` on success. */
    readonly error: string | null;
    /** RGB bytes (rows top to bottom) or `null` when the cell could not be rendered. */
    readonly image: RgbImage | null;
}

export interface RenderedBatch {
    readonly grammar: Grammar;
    readonly cells: readonly RenderedCell[];
}

/**
 * The in-app twin of the bench's GPU half: renders a lot of `(grammar, seed)` images on **one**
 * reused offscreen surface and reads them back. Consumed by the gallery (display) and by
 * `src/bench/page.ts` (the offline dataset pilot), so both go through the exact same pixels.
 *
 * Every failure is a value per cell, not an exception: a generated shader the driver refuses is a
 * normal outcome, and one dead cell must not abort a lot. Only building the surface itself can
 * throw (e.g. no WebGL2).
 */
export interface BatchRenderer {
    /** Renders every request at `size`; reuses the surface, recreating it when `size` changes. */
    render(requests: readonly BatchRequest[], size: number): readonly RenderedBatch[];
    /** Destroys the surface and detaches its canvas. The renderer must not be used afterwards. */
    destroy(): void;
}

interface Stage {
    readonly size: number;
    readonly canvas: HTMLCanvasElement;
    readonly surface: GpuSurface;
    readonly readback: CanvasRenderingContext2D;
}

/**
 * The canvas must be laid out (non-zero `clientWidth`) before `GpuSurface` exists, so it is
 * appended off-screen with an explicit pixel size — invisible, but measurable. `document` is a
 * shell concern (conventions §6): the batch renderer is the shell, the compiler stays pure.
 */
function createStage(size: number): Stage {
    const canvas = document.createElement('canvas');

    canvas.style.cssText = `position:fixed;left:-10000px;top:0;pointer-events:none;display:block;width:${String(
        size,
    )}px;height:${String(size)}px`;
    document.body.append(canvas);

    const surface = createGpuSurface({
        canvas,
        dpr: createDevicePixelRatio(1),
        contextOptions: DEFAULT_CONTEXT_OPTIONS,
    });

    if (canvas.width !== size || canvas.height !== size) {
        surface.destroy();
        canvas.remove();

        throw new Error(`Canvas is ${canvas.width}x${canvas.height}, expected ${size}x${size}`);
    }

    const readbackCanvas = document.createElement('canvas');

    readbackCanvas.width = size;
    readbackCanvas.height = size;

    const readback = readbackCanvas.getContext('2d', { willReadFrequently: true });

    if (!readback) {
        surface.destroy();
        canvas.remove();

        throw new Error('2D readback context unavailable');
    }

    return { size, canvas, surface, readback };
}

function renderCell(stage: Stage, catalog: Catalog, grammar: Grammar, seed: Seed): RenderedCell {
    try {
        const expression = generate(catalog, grammar, seed);
        const { source } = compile(catalog, expression, { channels: grammar.channels });
        const attempt = stage.surface.tryCreateProgram(source);

        if (!attempt.ok) {
            return { error: attempt.error.message, image: null };
        }

        try {
            // Phase 0: `u_phase` is never set, so the uniform defaults to 0 and the image is the
            // static one. Time terminals are the constants 0/1 there (see `sampleGrammars`).
            stage.surface.renderProgram(attempt.program);
            stage.readback.drawImage(stage.canvas, 0, 0);

            const { data } = stage.readback.getImageData(0, 0, stage.size, stage.size);
            const pixelCount = stage.size * stage.size;
            const rgb = new Uint8Array(pixelCount * 3);

            for (let p = 0; p < pixelCount; p++) {
                rgb[p * 3] = data[p * 4];
                rgb[p * 3 + 1] = data[p * 4 + 1];
                rgb[p * 3 + 2] = data[p * 4 + 2];
            }

            return { error: null, image: { width: stage.size, height: stage.size, rgb } };
        } finally {
            attempt.program.destroy();
        }
    } catch (error) {
        return { error: error instanceof Error ? error.message : String(error), image: null };
    }
}

export function createBatchRenderer(catalog: Catalog): BatchRenderer {
    let stage: Stage | null = null;

    return {
        render(requests, size) {
            if (stage?.size !== size) {
                stage?.surface.destroy();
                stage?.canvas.remove();
                stage = createStage(size);
            }

            const current = stage;

            return requests.map(({ grammar, seeds }) => ({
                grammar,
                cells: seeds.map((seed) => renderCell(current, catalog, grammar, seed)),
            }));
        },
        destroy() {
            stage?.surface.destroy();
            stage?.canvas.remove();
            stage = null;
        },
    };
}
