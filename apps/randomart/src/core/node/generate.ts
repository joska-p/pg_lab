import type { Buffer } from 'node:buffer';

import { CHANNELS } from '../color.ts';
import type { Channel } from '../color.ts';
import { compileToShader } from '../compileToGLSL.ts';
import { toMathString } from '../format.ts';
import { DEFAULT_RULE_ID, getRule } from '../grammar/rules/registry.ts';
import type { RuleId } from '../grammar/rules/registry.ts';
import { buildChannelTrees, evaluate } from '../tree.ts';
import type { ChannelTrees } from '../tree.ts';
import { encodePNG } from './png.ts';

export interface GenerateOptions {
    ruleId?: RuleId;
    enabledRuleIds?: RuleId[];
    size?: number;
}

export interface GenerateResult {
    png: Buffer;
    shader: string;
    math: Record<Channel, string>;
    trees: ChannelTrees;
}

export interface GenerateError {
    error: string;
}

const DEFAULT_SIZE = 256;
const MAX_SIZE = 4096;

export function generate(
    seedText: string,
    options: GenerateOptions = {},
): GenerateResult | GenerateError {
    try {
        if (typeof seedText !== 'string' || seedText.length === 0) {
            return { error: 'textSeed must be a non-empty string.' };
        }

        const ruleId = options.ruleId ?? DEFAULT_RULE_ID;

        if (options.enabledRuleIds && !options.enabledRuleIds.includes(ruleId)) {
            return { error: `Rule "${ruleId}" is not enabled.` };
        }

        const rule = getRule(ruleId);

        const size = options.size ?? DEFAULT_SIZE;

        if (!Number.isInteger(size) || size < 1 || size > MAX_SIZE) {
            return {
                error: `size must be an integer between 1 and ${MAX_SIZE} (received ${String(
                    options.size,
                )}).`,
            };
        }

        const trees = buildChannelTrees({
            seedText,
            rule,
            correlated: false,
        });

        // Rasterize: evaluate all three trees at each pixel's normalized coordinate.
        const pixels = new Uint8Array(size * size * 3);

        for (let py = 0; py < size; py++) {
            const y = (py / (size - 1 || 1)) * 2 - 1;

            for (let px = 0; px < size; px++) {
                const x = (px / (size - 1 || 1)) * 2 - 1;
                const idx = (py * size + px) * 3;

                for (let offset = 0; offset < CHANNELS.length; offset++) {
                    const value = Math.round((evaluate(trees[CHANNELS[offset]], x, y) + 1) * 127.5);
                    pixels[idx + offset] = Math.max(0, Math.min(255, value));
                }
            }
        }

        const png = encodePNG(pixels, size, size);
        const shader = compileToShader({ seedText, trees });

        return {
            png,
            shader,
            trees,
            math: {
                red: toMathString(trees.red),
                green: toMathString(trees.green),
                blue: toMathString(trees.blue),
            },
        };
    } catch (err) {
        return { error: (err as Error).message };
    }
}
