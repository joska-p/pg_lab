import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { learn, printResults } from './learn';

/** Defaults are resolved against this file so the command works from any working directory. */
const DEFAULT_INPUT = fileURLToPath(new URL('../data/samples.json', import.meta.url));
const DEFAULT_OUTPUT = fileURLToPath(new URL('../data/coefficients.json', import.meta.url));

const { values } = parseArgs({
    options: {
        input: { type: 'string' },
        output: { type: 'string' },
        lambda: { type: 'string' },
        'top-n': { type: 'string' },
    },
});

function numberOption(value: string | undefined, fallback: number): number {
    if (value === undefined) {
        return fallback;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid number: ${value}`);
    }

    return parsed;
}

const input = values.input ?? DEFAULT_INPUT;
const output = values.output ?? DEFAULT_OUTPUT;
const lambda = numberOption(values.lambda, 0.01);
const topN = numberOption(values['top-n'], 10);

const results = learn({ input, output, lambda, topN });
printResults(results, topN);
console.log(`Wrote coefficients to ${output}`);
