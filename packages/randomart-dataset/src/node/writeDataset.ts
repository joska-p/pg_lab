import { closeSync, mkdirSync, openSync, writeFileSync, writeSync } from 'node:fs';
import { join } from 'node:path';

import type { GrammarData } from '@repo/randomart-core/artwork/serialize';
import { chromium } from 'playwright-core';

import { DATASET_PAGE } from './devServer';

export interface WriteDatasetOptions {
    /** The running app: `dataset.html` is loaded from it. */
    readonly url: string;
    readonly count: number;
    readonly seedsPerGrammar: number;
    readonly size: number;
    readonly baseSeed: number;
    /** Output directory, receiving `dataset.json` + `pixels.bin`. */
    readonly out: string;
    /** Hardware WebGL, or software rendering where there is no usable GPU. */
    readonly mode: 'gpu' | 'swiftshader';
}

const MODES: Record<WriteDatasetOptions['mode'], string[]> = {
    gpu: ['--ignore-gpu-blocklist'],
    swiftshader: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
};
const STARTUP_TIMEOUT_MS = 30_000;

/** One grammar of `dataset.json`, with the seeds it was drawn with and whether they rendered. */
interface WrittenGrammar {
    readonly grammar: GrammarData;
    readonly seeds: readonly number[];
    /** One flag per seed: false when generation, compilation or the driver refused the image. */
    readonly ok: readonly boolean[];
}

/**
 * Renders the dataset: samples grammars, draws every `(grammar, seed)` image in a headless browser
 * and streams the pixels to disk. The app must be served at `options.url` — see `withDevServer`.
 */
export async function writeDataset(options: WriteDatasetOptions): Promise<void> {
    const { url, count, seedsPerGrammar, size, baseSeed, out, mode } = options;

    mkdirSync(out, { recursive: true });

    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium',
        headless: true,
        args: MODES[mode],
    });
    const page = await browser.newPage();

    page.on('pageerror', (error) => console.error('[page]', error.message));

    try {
        await page.goto(`${url}${DATASET_PAGE}`);
        await page.waitForFunction(() => window.datasetApi !== undefined, null, {
            timeout: STARTUP_TIMEOUT_MS,
        });

        const sampled = await page.evaluate(
            ({ count, opts }) => {
                const api = window.datasetApi;

                if (!api) {
                    throw new Error('datasetApi is not ready');
                }

                return api.sample(count, opts);
            },
            { count, opts: { baseSeed, seedsPerGrammar } },
        );

        const pixels = openSync(join(out, 'pixels.bin'), 'w');
        const grammars: WrittenGrammar[] = [];
        let failed = 0;
        const started = Date.now();

        try {
            for (const [index, { grammar, seeds }] of sampled.items.entries()) {
                const result = await page.evaluate(
                    ({ grammar, seeds, px }) => {
                        const api = window.datasetApi;

                        if (!api) {
                            throw new Error('datasetApi is not ready');
                        }

                        return api.renderGrammar(grammar, seeds, px);
                    },
                    { grammar, seeds, px: size },
                );

                // A failed image stays all zeros: the dataset contract (`ok` flags them, and the
                // offline side never reads the pixels of a false cell).
                writeSync(pixels, Buffer.from(result.rgb, 'base64'));
                failed += result.ok.filter((flag) => !flag).length;
                grammars.push({ grammar, seeds, ok: result.ok });

                const elapsed = ((Date.now() - started) / 1000).toFixed(1);

                process.stderr.write(
                    `\r${index + 1}/${count} grammars, ${failed} failed, ${elapsed}s`,
                );
            }
        } finally {
            closeSync(pixels);
        }

        writeFileSync(
            join(out, 'dataset.json'),
            `${JSON.stringify(
                {
                    format: 'randomart-dataset',
                    version: 1,
                    generatorVersion: sampled.generatorVersion,
                    size,
                    channels: 3,
                    seedsPerGrammar,
                    // Image (g, k) starts at byte ((g * seedsPerGrammar + k) * size * size * 3);
                    // rows top to bottom, RGB interleaved; failed images are all zeros (see `ok`).
                    layout: 'grammar-major, seed-minor, row-major, RGB',
                    grammars,
                },
                null,
                2,
            )}\n`,
        );
        process.stderr.write(`\nWrote ${join(out, 'dataset.json')} and pixels.bin\n`);
    } finally {
        await browser.close();
    }
}
