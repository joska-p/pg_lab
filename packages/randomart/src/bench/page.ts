import { createDevicePixelRatio } from '@repo/glaze/core/render';
import { createGpuSurface } from '@repo/glaze/gpu/GpuSurface';
import type { GpuSurface } from '@repo/glaze/gpu/GpuSurface';

import { deserializeGrammar, serializeGrammar } from '../core/artwork/index.ts';
import type { GrammarData } from '../core/artwork/index.ts';
import { createDefaultCatalog } from '../core/catalog/index.ts';
import { compile } from '../core/compiler/index.ts';
import { generate, GENERATOR_VERSION } from '../core/generator/index.ts';
import { sampleGrammars } from '../core/grammar/index.ts';
import type { SampleOptions } from '../core/grammar/index.ts';
import { createSeed } from '../core/random/index.ts';
import { DEFAULT_CONTEXT_OPTIONS } from '../renderer/contract.ts';

/**
 * Bench renderer page: the in-browser half of the offline bench. It owns every TypeScript step
 * (sampling, generation, compilation, GPU draw) and `scripts/bench/generate.mjs` only drives it
 * through `window.benchApi`. Images are drawn at phase 0 (`u_phase` is never set: the uniform
 * defaults to 0), one program at a time, on a single reused surface.
 */
const catalog = createDefaultCatalog();

interface Stage {
    readonly size: number;
    readonly canvas: HTMLCanvasElement;
    readonly surface: GpuSurface;
    readonly readback: CanvasRenderingContext2D;
}

let stage: Stage | null = null;

function ensureStage(size: number): Stage {
    if (stage?.size === size) {
        return stage;
    }

    stage?.surface.destroy();
    stage?.canvas.remove();

    // The canvas must be in the DOM with an explicit CSS size *before* the surface exists:
    // `GpuSurface` sizes its buffer from `clientWidth`, which is 0 for a detached canvas.
    const canvas = document.createElement('canvas');

    canvas.style.cssText = `display:block;width:${size}px;height:${size}px`;
    document.body.append(canvas);

    const surface = createGpuSurface({
        canvas,
        dpr: createDevicePixelRatio(1),
        contextOptions: DEFAULT_CONTEXT_OPTIONS,
    });

    if (canvas.width !== size || canvas.height !== size) {
        throw new Error(`Canvas is ${canvas.width}x${canvas.height}, expected ${size}x${size}`);
    }

    const readbackCanvas = document.createElement('canvas');

    readbackCanvas.width = size;
    readbackCanvas.height = size;

    const readback = readbackCanvas.getContext('2d', { willReadFrequently: true });

    if (!readback) {
        throw new Error('2D readback context unavailable');
    }

    stage = { size, canvas, surface, readback };

    return stage;
}

function bytesToBase64(bytes: Uint8Array): string {
    const CHUNK = 0x8000;
    let binary = '';

    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }

    return btoa(binary);
}

export interface RenderedGrammar {
    /** One flag per seed: false when generation, compilation or the driver refused the image. */
    readonly ok: readonly boolean[];
    /** One message per seed, null on success. */
    readonly errors: readonly (string | null)[];
    /** Base64 of `seeds.length * size * size * 3` bytes: RGB, rows top to bottom, zeros on failure. */
    readonly rgb: string;
}

function renderGrammar(
    grammarData: GrammarData,
    seeds: readonly number[],
    size: number,
): RenderedGrammar {
    const { surface, canvas, readback } = ensureStage(size);
    const grammar = deserializeGrammar(catalog, grammarData);
    const pixelCount = size * size;
    const rgb = new Uint8Array(seeds.length * pixelCount * 3);
    const ok: boolean[] = [];
    const errors: (string | null)[] = [];

    seeds.forEach((rawSeed, index) => {
        try {
            const expression = generate(catalog, grammar, createSeed(rawSeed));
            const { source } = compile(catalog, expression, { channels: grammar.channels });
            const attempt = surface.tryCreateProgram(source);

            // A driver refusal is a normal outcome for a generated shader: record it, move on.
            if (!attempt.ok) {
                ok.push(false);
                errors.push(attempt.error.message);

                return;
            }

            try {
                surface.renderProgram(attempt.program);
                readback.drawImage(canvas, 0, 0);

                const { data } = readback.getImageData(0, 0, size, size);
                const base = index * pixelCount * 3;

                for (let p = 0; p < pixelCount; p++) {
                    rgb[base + p * 3] = data[p * 4];
                    rgb[base + p * 3 + 1] = data[p * 4 + 1];
                    rgb[base + p * 3 + 2] = data[p * 4 + 2];
                }
            } finally {
                attempt.program.destroy();
            }

            ok.push(true);
            errors.push(null);
        } catch (error) {
            ok.push(false);
            errors.push(error instanceof Error ? error.message : String(error));
        }
    });

    return { ok, errors, rgb: bytesToBase64(rgb) };
}

function sample(count: number, options: SampleOptions) {
    return {
        generatorVersion: GENERATOR_VERSION,
        items: sampleGrammars(catalog, count, options).map(({ grammar, seeds }) => ({
            grammar: serializeGrammar(grammar),
            seeds: [...seeds] as number[],
        })),
    };
}

const benchApi = { sample, renderGrammar };

export type BenchApi = typeof benchApi;

declare global {
    interface Window {
        benchApi?: BenchApi;
    }
}

window.benchApi = benchApi;
