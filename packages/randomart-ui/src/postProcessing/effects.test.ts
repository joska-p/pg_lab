import { spawnSync } from 'node:child_process';

import { describe, expect, it } from 'vite-plus/test';

import { POST_PROCESS_EFFECTS } from './effects';

describe('post-processing shaders', () => {
    const glslang = 'glslangValidator';
    const checkAvailable = () => {
        try {
            return spawnSync(glslang, ['--version'], { encoding: 'utf8' }).status === 0;
        } catch {
            return false;
        }
    };

    if (!checkAvailable()) {
        if (process.env.CI) {
            console.warn(
                'glslangValidator is not available; GLSL validation tests are skipped. ' +
                    'Install it (e.g. `npm install -g glslang-validator`) to enable them.',
            );
        }
        return;
    }

    for (const effect of POST_PROCESS_EFFECTS) {
        it(`compiles the ${effect.id} pass`, () => {
            const result = spawnSync(glslang, ['--stdin', '-S', 'frag'], {
                input: effect.fragmentShader,
                encoding: 'utf8',
                timeout: 10000,
            });

            if (result.status !== 0) {
                console.error(`GLSL validation failed for effect ${effect.id}`);
                console.error(effect.fragmentShader);
                console.error(result.stdout + result.stderr);
            }

            expect(result.status).toBe(0);
        });
    }
});
