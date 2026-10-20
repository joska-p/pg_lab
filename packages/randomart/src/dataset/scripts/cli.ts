/**
 * The dataset pipeline: one step per subcommand, the whole chain with `run`.
 *
 *     vp run dataset            write → features → pca → sheet
 *     vp run dataset:features   one step, from an existing `--out` directory
 *
 * Every step reads and writes the same directory (`/dataset/` by default, git-ignored), so the
 * pipeline is a chain over one folder rather than five scripts to remember.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { computeFeatures } from './computeFeatures';
import type { Features } from './computeFeatures';
import { buildContactSheet } from './contactSheet';
import { withDevServer } from './devServer';
import { loadDataset } from './loadDataset';
import { buildPcaReport, formatPcaReport } from './pcaReport';
import type { GrammarInput } from './pcaReport';
import { encodePng } from './png';
import { writeDataset } from './writeDataset';
import type { WriteDatasetOptions } from './writeDataset';

const COMMANDS = ['run', 'write', 'features', 'pca', 'sheet'] as const;
type Command = (typeof COMMANDS)[number];

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        url: { type: 'string', default: 'http://localhost:5173' },
        count: { type: 'string', default: '100' },
        seeds: { type: 'string', default: '16' },
        size: { type: 'string', default: '128' },
        base: { type: 'string', default: '1' },
        out: { type: 'string', default: 'dataset' },
        mode: { type: 'string', default: 'gpu' },
        only: { type: 'string' },
        std: { type: 'boolean', default: false },
        rows: { type: 'string', default: '12' },
        start: { type: 'string', default: '0' },
        grammars: { type: 'string' },
    },
});

function renderMode(): WriteDatasetOptions['mode'] {
    if (values.mode === 'gpu' || values.mode === 'swiftshader') {
        return values.mode;
    }

    throw new Error(`--mode must be gpu or swiftshader, got ${values.mode}`);
}

function onlyFamily(): 'structure' | 'color' | undefined {
    if (values.only === undefined || values.only === 'structure' || values.only === 'color') {
        return values.only;
    }

    throw new Error(`--only must be structure or color, got ${values.only}`);
}

function writeStep(): Promise<void> {
    const options: WriteDatasetOptions = {
        url: values.url,
        count: Number(values.count),
        seedsPerGrammar: Number(values.seeds),
        size: Number(values.size),
        baseSeed: Number(values.base),
        out: values.out,
        mode: renderMode(),
    };

    // The page is served by the app itself: a browser cannot open a dev server on its own.
    return withDevServer(options.url, () => writeDataset(options));
}

function featuresStep(): void {
    const dataset = loadDataset(values.out);
    const features = computeFeatures(dataset);
    const path = join(values.out, 'features.json');

    writeFileSync(path, `${JSON.stringify(features, null, 2)}\n`);
    console.log(
        `${path}: ${features.rows.length}/${dataset.grammars.length} grammars, ${features.names.length} descriptors`,
    );
}

function pcaStep(): void {
    const features = JSON.parse(
        readFileSync(join(values.out, 'features.json'), 'utf8'),
    ) as Features;
    const { grammars } = loadDataset(values.out);
    const inputs = grammars.map((entry) => entry.grammar as GrammarInput);
    const report = buildPcaReport(features, inputs, { only: onlyFamily(), std: values.std });
    const path = join(values.out, 'pca.json');

    console.log(formatPcaReport(report));
    writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
}

function sheetStep(): void {
    const sheet = buildContactSheet(loadDataset(values.out), {
        grammars: values.grammars?.split(',').map(Number),
        start: Number(values.start),
        rows: Number(values.rows),
    });
    const path = join(values.out, 'sheet.png');

    writeFileSync(path, encodePng(sheet.rgb, sheet.width, sheet.height));
    console.log(`${path}: grammars ${sheet.indices.join(',')}, ${sheet.width}x${sheet.height}`);
}

const STEPS: Record<Command, () => void | Promise<void>> = {
    write: writeStep,
    features: featuresStep,
    pca: pcaStep,
    sheet: sheetStep,
    run: async () => {
        for (const step of ['write', 'features', 'pca', 'sheet'] as const) {
            await STEPS[step]();
        }
    },
};

function isCommand(value: string): value is Command {
    return (COMMANDS as readonly string[]).includes(value);
}

const [command = 'run'] = positionals;

try {
    if (!isCommand(command)) {
        throw new Error(`Unknown step "${command}" — steps: ${COMMANDS.join(', ')}`);
    }

    await STEPS[command]();
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
}
