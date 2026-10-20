import { createDevicePixelRatio } from '@repo/glaze/core/render';
import { createGpuSurface } from '@repo/glaze/gpu/GpuSurface';
import type { GpuSurface } from '@repo/glaze/gpu/GpuSurface';

import type { Catalog } from '../../core/catalog/Catalog';
import { compile } from '../../core/compiler/compile';
import { generate } from '../../core/generator/generator';
import { channelModelOf } from '../../core/grammar/grammar';
import type { Grammar } from '../../core/grammar/types';
import type { Seed } from '../../core/random/seed';
import type { RgbImage } from '../../dataset/analysis/descriptors';
import { DEFAULT_CONTEXT_OPTIONS } from '../contract/contract';

interface BatchRequest {
    readonly grammar: Grammar;
    readonly seeds: readonly Seed[];
}

interface RenderedCell {
    readonly error: string | null;
    readonly image: RgbImage | null;
}

export interface RenderedBatch {
    readonly grammar: Grammar;
    readonly cells: readonly RenderedCell[];
}

/**
 * Renders `(grammar, seed)` images on a reused offscreen surface. Used by the bench and the offline
 * dataset pipeline so both go through the exact same pixels.
 *
 * Failures are values per cell, not exceptions: a shader the driver refuses is a normal outcome,
 * and one dead cell must not abort a lot. Only surface creation can throw (e.g., no WebGL2).
 */
export interface BatchRenderer {
    render(requests: readonly BatchRequest[], size: number): readonly RenderedBatch[];
    destroy(): void;
}

interface Stage {
    readonly size: number;
    readonly canvas: HTMLCanvasElement;
    readonly surface: GpuSurface;
    readonly readback: CanvasRenderingContext2D;
}

/**
 * The canvas must have a layout size before `GpuSurface` is created. We append it off-screen with
 * an explicit pixel size so it's measurable without being visible.
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
        const { source } = compile(catalog, expression, { channels: channelModelOf(grammar) });
        const attempt = stage.surface.tryCreateProgram(source);

        if (!attempt.ok) {
            return { error: attempt.error.message, image: null };
        }

        try {
            // Phase 0: `u_phase` defaults to 0 — the frozen first frame of the loop.
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
