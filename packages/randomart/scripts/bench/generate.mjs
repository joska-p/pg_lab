// Needs the dev server running (`vp dev`) in another terminal.
// Usage: node scripts/bench/generate.mjs --count 100 --seeds 16 --size 128 --out dataset
import { closeSync, mkdirSync, openSync, writeFileSync, writeSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { chromium } from 'playwright-core';

const { values } = parseArgs({
    options: {
        url: { type: 'string', default: 'http://localhost:5173' },
        count: { type: 'string', default: '100' },
        seeds: { type: 'string', default: '16' },
        size: { type: 'string', default: '128' },
        base: { type: 'string', default: '1' },
        out: { type: 'string', default: 'dataset' },
        mode: { type: 'string', default: 'gpu' },
    },
});

const MODES = {
    gpu: ['--ignore-gpu-blocklist'],
    swiftshader: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
};
const count = Number(values.count);
const seedsPerGrammar = Number(values.seeds);
const size = Number(values.size);
const baseSeed = Number(values.base);

mkdirSync(values.out, { recursive: true });

const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium',
    headless: true,
    args: MODES[values.mode],
});
const page = await browser.newPage();

page.on('pageerror', (error) => console.error('[page]', error.message));
await page.goto(`${values.url}/bench.html`);
await page.waitForFunction(() => window.benchApi !== undefined, null, { timeout: 30_000 });

const sampled = await page.evaluate(
    ([n, options]) => window.benchApi.sample(n, options),
    [count, { baseSeed, seedsPerGrammar }],
);

const fd = openSync(join(values.out, 'pixels.bin'), 'w');
const grammars = [];
let failed = 0;
const started = Date.now();

for (const [index, { grammar, seeds }] of sampled.items.entries()) {
    const result = await page.evaluate(
        ([g, s, px]) => window.benchApi.renderGrammar(g, s, px),
        [grammar, seeds, size],
    );

    writeSync(fd, Buffer.from(result.rgb, 'base64'));
    failed += result.ok.filter((flag) => !flag).length;
    grammars.push({ grammar, seeds, ok: result.ok });

    const elapsed = ((Date.now() - started) / 1000).toFixed(1);

    process.stderr.write(`\r${index + 1}/${count} grammars, ${failed} failed, ${elapsed}s`);
}

closeSync(fd);
await browser.close();

writeFileSync(
    join(values.out, 'dataset.json'),
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
process.stderr.write(`\nWrote ${values.out}/dataset.json and pixels.bin\n`);
