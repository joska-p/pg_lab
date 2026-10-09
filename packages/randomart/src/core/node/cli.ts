import { writeFile } from 'node:fs/promises';
import process from 'node:process';

import { CHANNELS } from '../color.ts';
import { toTreeView } from '../format.ts';
import { listRules, ruleIds } from '../grammar/rules/registry.ts';
import type { RuleId } from '../types.ts';
import { generate } from './generate.ts';

const USAGE = `
randomart — generate visual hash art from a text seed

Usage:
  tsx randomart <textseed> <outputfile> [options]

Arguments:
  <textseed>     Seed string to visualize (required)
  <outputfile>   Path to write the PNG output (required)

Options:
  --rule <id>            Grammar rule id (default: "classic")
  --size <number>        Square output size in pixels (default: 256)
  -h, --help             Show this help message

Available rules:
${listRules()
    .map((rule) => `  ${rule.id.padEnd(30)} ${rule.label}`)
    .join('\n')}

Example:
  tsx randomart "hello world" out.png --rule paper --size 512
`.trim();

interface ParsedArgs {
    textSeed?: string;
    outputFile?: string;
    ruleId?: RuleId;
    size?: number;
    help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
    const result: ParsedArgs = { help: false };
    const positionals: string[] = [];

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        switch (arg) {
            case '-h':
            case '--help': {
                result.help = true;
                break;
            }
            case '--rule': {
                const val = argv[++i];

                if (!ruleIds.includes(val as RuleId)) {
                    throw new Error(`Invalid rule id "${val}".`);
                }

                result.ruleId = val as RuleId;
                break;
            }
            case '--size': {
                const val = argv[++i];
                const n = Number(val);

                if (!Number.isInteger(n)) {
                    throw new Error(`--size must be an integer (received "${val}").`);
                }

                result.size = n;
                break;
            }
            default: {
                if (arg.startsWith('--')) {
                    throw new Error(`Unknown option "${arg}".`);
                }

                positionals.push(arg);
            }
        }
    }

    // Parse bug carried over from the source CLI: positionals were collected
    // but never assigned, so every invocation failed with "missing argument".
    if (positionals.length > 0) {
        result.textSeed = positionals[0];
    }
    if (positionals.length > 1) {
        result.outputFile = positionals[1];
    }
    if (positionals.length > 2) {
        throw new Error(`Unexpected argument "${positionals[2]}".`);
    }

    return result;
}

function fail(message: string): never {
    console.error(`Error: ${message}\n`);
    console.error(USAGE);
    process.exit(1);
}

async function main(): Promise<void> {
    let parsed: ParsedArgs;

    try {
        parsed = parseArgs(process.argv.slice(2));
    } catch (err) {
        fail((err as Error).message);
    }

    if (parsed.help) {
        console.log(USAGE);
        process.exit(0);
    }

    if (!parsed.textSeed) {
        fail('Missing required argument <textseed>.');
    }

    if (!parsed.outputFile) {
        fail('Missing required argument <outputfile>.');
    }

    const result = generate(parsed.textSeed, {
        ...(parsed.ruleId !== undefined && { ruleId: parsed.ruleId }),
        ...(parsed.size !== undefined && { size: parsed.size }),
    });

    if ('error' in result) {
        fail(result.error);
    }

    try {
        await writeFile(parsed.outputFile, result.png);
    } catch (err) {
        fail(`Could not write output file: ${(err as Error).message}`);
    }

    console.log(`Wrote ${result.png.length} bytes to ${parsed.outputFile}`);
    console.log(`Rule:  ${parsed.ruleId ?? 'classic'}`);
    console.log();

    for (const channel of CHANNELS) {
        console.log(`${channel} channel:`);
        console.log(`  Math: ${result.math[channel]}`);
        console.log(toTreeView(result.trees[channel]));
    }
}

void main();
