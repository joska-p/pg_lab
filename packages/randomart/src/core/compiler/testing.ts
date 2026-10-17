/**
 * Test helpers only (not exported from the compiler index): a pure structural checker for emitted
 * GLSL, and a deterministic builder of (grammar, seed) fuzz cases. No GPU involved.
 */

import type { Catalog } from '../catalog/index.ts';
import { COLOR_SPACE_IDS, RAW_CHANNELS } from '../color/index.ts';
import type { ChannelModel } from '../color/index.ts';
import type { Node } from '../expression/index.ts';
import { createGrammar, defaultGrammar, randomizeWeights } from '../grammar/index.ts';
import type { Grammar } from '../grammar/index.ts';
import { createRng, createSeed } from '../random/index.ts';
import type { Seed } from '../random/index.ts';

/**
 * Structural problems of an emitted fragment shader (empty array = fine). Not a GLSL parser: it
 * catches the failure modes this compiler can actually produce.
 *
 * - `--` (invalid decrement from a negative literal under `neg`);
 * - Unbalanced parentheses or braces;
 * - Uniforms used but not declared;
 * - `v<n>` / `c<n>` used before their declaration, or declared twice;
 * - Integer literals (GLSL ES 3.00 does not convert int to float implicitly).
 */
export function checkShaderStructure(source: string): string[] {
    const problems = new Set<string>();

    if (source.includes('--')) {
        problems.add('contains "--"');
    }

    for (const [open, close] of [
        ['(', ')'],
        ['{', '}'],
    ] as const) {
        let depth = 0;

        for (const char of source) {
            if (char === open) {
                depth++;
            } else if (char === close) {
                depth--;
            }

            if (depth < 0) {
                problems.add(`unbalanced "${close}"`);
                break;
            }
        }

        if (depth > 0) {
            problems.add(`unclosed "${open}"`);
        }
    }

    const declaredUniforms = new Set(
        [...source.matchAll(/^uniform\s+\w+\s+(u_\w+);/gm)].map((match) => match[1]),
    );

    for (const match of source.matchAll(/\bu_\w+\b/g)) {
        if (!declaredUniforms.has(match[0])) {
            problems.add(`uniform ${match[0]} used but not declared`);
        }
    }

    const mainIndex = source.indexOf('void main() {');

    if (mainIndex === -1) {
        problems.add('no main()');

        return [...problems];
    }

    const declared = new Set<string>();

    for (const line of source.slice(mainIndex).split('\n')) {
        const declaration = /^\s*(?:float|vec2)\s+([vc]\d+)\s*=\s*(.*);$/.exec(line);
        const expression = declaration ? declaration[2] : line;

        for (const match of expression.matchAll(/\b[vc]\d+\b/g)) {
            if (!declared.has(match[0])) {
                problems.add(`${match[0]} used before its declaration`);
            }
        }

        if (declaration) {
            if (declared.has(declaration[1])) {
                problems.add(`${declaration[1]} declared twice`);
            }

            declared.add(declaration[1]);
        }

        const integerLiteral = /(?<![\w.])(?<![eE][+-])\d+(?![\w.])/.exec(expression);

        if (integerLiteral) {
            problems.add(`integer literal "${integerLiteral[0]}" in "${line.trim()}"`);
        }
    }

    return [...problems];
}

/** True when the tree contains one of the given operators. */
export function usesOperator(node: Node, names: ReadonlySet<string>): boolean {
    return names.has(node.operatorName) || node.inputs.some((child) => usesOperator(child, names));
}

export interface FuzzCase {
    readonly label: string;
    readonly grammar: Grammar;
    readonly seed: Seed;
}

/**
 * Deterministic cases mixing the default grammar and randomized grammars (wider operator mix,
 * deeper trees), across the channel model's two axes, so the fuzz covers more than the default
 * vocabulary. Even `i` is a raw triplet with independent channels; odd `i` is a shared trunk read
 * in each colour space in turn, half of those fully shared (`shareDepth = maxDepth`, so `r = g =
 * b`) — both emission paths and both generator shapes are exercised.
 */
export function buildFuzzCases(catalog: Catalog, count: number): FuzzCase[] {
    const cases: FuzzCase[] = [];
    const base = defaultGrammar(catalog);

    for (let i = 0; i < count; i++) {
        const seed = createSeed(i * 7919 + 1);
        const kind = i % 2;
        const channels: ChannelModel =
            kind === 0
                ? RAW_CHANNELS
                : {
                      space: COLOR_SPACE_IDS[Math.floor(i / 2) % COLOR_SPACE_IDS.length],
                      shareDepth: i % 4 === 1 ? 2 : base.constraints.maxDepth,
                  };
        const colored = createGrammar(catalog, {
            weights: base.weights,
            constraints: base.constraints,
            channels,
        });
        let grammar: Grammar;
        let label: string;

        if (kind === 0) {
            grammar = colored;
            label = `default#${i}`;
        } else {
            grammar = randomizeWeights(catalog, colored, createRng(createSeed(i + 1)));
            label = `random#${i}`;
        }

        cases.push({ label, grammar, seed });
    }

    return cases;
}
