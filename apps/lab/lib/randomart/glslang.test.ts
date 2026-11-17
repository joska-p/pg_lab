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
            console.warn(
                'glslangValidator is not available; GLSL validation tests are skipped. ' +
                    'Install it (e.g. `npm install -g glslang-validator`) to enable them.',
            );
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

    // Mirrors the preamble injected by the surface renderer (`compileProgram`) around a Shadertoy
    // `mainImage` shader; duplicated here because core does not depend on the renderer.
    const SHADERTOY_PREAMBLE = `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform int iFrame;
uniform vec4 iMouse;

in vec2 fragCoord;
in vec2 vUv;
out vec4 fragColor;`;

    function asWebGlFragment(source: string): string {
        return `${SHADERTOY_PREAMBLE}

${source}

void main() {
  mainImage(fragColor, fragCoord);
}
`;
    }

    it('validates default grammar shaders', () => {
        const preset = getGrammarPreset('default');
        const grammar = preset.grammar;
        const seeds = [0, 42, 1234, 9999];

        for (const seedValue of seeds) {
            const seed = createSeed(String(seedValue));
            const expression = generate(grammar, seed);
            const compiled = compile(expression, { space: preset.space });
            const validation = validateGlsl(asWebGlFragment(compiled.source));

            if (!validation.valid) {
                console.error('GLSL validation failed for seed', seedValue);
                console.error('Shader source:', asWebGlFragment(compiled.source));
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
            const compiled = compile(expression, { space: preset.space });
            const validation = validateGlsl(asWebGlFragment(compiled.source));

            if (!validation.valid) {
                console.error('GLSL validation failed for grammar', preset.id);
                console.error('Shader source:', asWebGlFragment(compiled.source));
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
            const compiled = compile(expression, { space: 'srgb' });
            const validation = validateGlsl(asWebGlFragment(compiled.source));

            if (!validation.valid) {
                console.error('GLSL validation failed for drawn grammar', i);
                console.error('Grammar:', JSON.stringify(grammar, null, 2));
                console.error('Shader source:', asWebGlFragment(compiled.source));
                console.error('glslangValidator output:', validation.output);
            }

            expect(validation.valid).toBe(true);
        }
    });
});
