import type { Buffer } from 'node:buffer';

import { compileToShader } from '../compileToGLSL.ts';
import { toMathString } from '../format.ts';
import { DEFAULT_RULE_ID, getRule } from '../grammar/rules/registry.ts';
import type { RuleId } from '../grammar/rules/registry.ts';
import { buildChannelTrees, evaluate } from '../tree.ts';
import type { Node } from '../tree.ts';
import { encodePNG } from './png.ts';

export interface GenerateOptions {
    ruleId?: RuleId;
    enabledRuleIds?: RuleId[];
    size?: number;
}

export interface GenerateResult {
    png: Buffer;
    shader: string;
    mathR: string;
    mathG: string;
    mathB: string;
    treeR: Node;
    treeG: Node;
    treeB: Node;
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

        const { treeR, treeG, treeB } = buildChannelTrees({
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
                const r = Math.round((evaluate(treeR, x, y) + 1) * 127.5);
                const g = Math.round((evaluate(treeG, x, y) + 1) * 127.5);
                const b = Math.round((evaluate(treeB, x, y) + 1) * 127.5);
                const idx = (py * size + px) * 3;

                pixels[idx] = Math.max(0, Math.min(255, r));
                pixels[idx + 1] = Math.max(0, Math.min(255, g));
                pixels[idx + 2] = Math.max(0, Math.min(255, b));
            }
        }

        const png = encodePNG(pixels, size, size);
        const shader = compileToShader({ seedText, treeR, treeG, treeB });

        return {
            png,
            shader,
            mathR: toMathString(treeR),
            mathG: toMathString(treeG),
            mathB: toMathString(treeB),
            treeR,
            treeG,
            treeB,
        };
    } catch (err) {
        return { error: (err as Error).message };
    }
}
