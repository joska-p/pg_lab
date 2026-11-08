import { spawnSync } from 'node:child_process';

import { describe, expect, it } from 'vite-plus/test';

import { compile } from './emit';
import { generate } from './generate';
import { drawGrammar, getGrammarPreset, GRAMMAR_PRESETS } from './grammar';
import { createRng } from './rng';
import { createSeed } from './seed';

describe('glslangValidator', () => {
    const glslang = 'glslangValidator';
    const checkAvailable = () => {
        try {
            const result = spawnSync(glslang, ['--version'], { encoding: 'utf8' });
            return result.status === 0;
        } catch {
            return false;
        }
    };

    const hasGlslang = checkAvailable();

    if (!hasGlslang) {
        if (process.env.CI) {
            it('requires glslangValidator on CI', () => {
                throw new Error(
                    'glslangValidator is required on CI but was not found. ' +
                        'Install it (e.g. `npm install -g glslang-validator`) before running the test suite.',
                );
            });
        } else {
            it.skip('glslangValidator not available, skipping GLSL validation', () => {});
        }
        return;
    }

    function validateGlsl(source: string): { valid: boolean; output: string } {
        // Compile (no -E preprocessing) so syntax errors are really caught
        const result = spawnSync(glslang, ['--stdin', '-S', 'frag'], {
            input: source,
            encoding: 'utf8',
            timeout: 10000,
        });
        return {
            valid: result.status === 0,
            output: result.stdout + result.stderr,
        };
    }

    it('validates default grammar shaders', () => {
        const grammar = getGrammarPreset('default').grammar;
        const seeds = [0, 42, 1234, 9999];

        for (const seedValue of seeds) {
            const seed = createSeed(String(seedValue));
            const expression = generate(grammar, seed);
            const compiled = compile(expression, { space: grammar.space });
            const validation = validateGlsl(compiled.source);

            if (!validation.valid) {
                console.error('GLSL validation failed for seed', seedValue);
                console.error('Shader source:', compiled.source);
                console.error('glslangValidator output:', validation.output);
            }

            expect(validation.valid).toBe(true);
        }
    });

    it('validates all registry grammars', () => {
        for (const preset of GRAMMAR_PRESETS) {
            const seed = createSeed(String(12345));
            const grammar = preset.grammar;
            const expression = generate(grammar, seed);
            const compiled = compile(expression, { space: grammar.space });
            const validation = validateGlsl(compiled.source);

            if (!validation.valid) {
                console.error('GLSL validation failed for grammar', preset.id);
                console.error('Shader source:', compiled.source);
                console.error('glslangValidator output:', validation.output);
            }

            expect(validation.valid).toBe(true);
        }
    });

    it('validates randomly drawn grammars', () => {
        const seed = createSeed('glsl-test-seed');
        const rng = createRng(seed);

        for (let i = 0; i < 20; i++) {
            const grammar = drawGrammar(rng);
            const expression = generate(grammar, createSeed(String(i)));
            const compiled = compile(expression, { space: grammar.space });
            const validation = validateGlsl(compiled.source);

            if (!validation.valid) {
                console.error('GLSL validation failed for drawn grammar', i);
                console.error('Grammar:', JSON.stringify(grammar, null, 2));
                console.error('Shader source:', compiled.source);
                console.error('glslangValidator output:', validation.output);
            }

            expect(validation.valid).toBe(true);
        }
    });
});
