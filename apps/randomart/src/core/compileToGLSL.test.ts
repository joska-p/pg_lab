import { describe, expect, it } from 'vite-plus/test';

import { BEHAVIORS } from './behaviors/registry';
import { compileToShader } from './compileToGLSL';
import { DEFAULT_RULE_ID, getRule } from './grammar/rules/registry';
import { buildChannelTrees } from './tree';

// The shader is fed straight to `@repo/glaze/react/GpuCanvas`, whose fullscreen
// vertex shader emits `vUv` and whose surface clock drives `u_clockTime`. These
// tests pin the names the renderer actually provides.
const trees = buildChannelTrees({
    seedText: 'glaze-contract',
    rule: getRule(DEFAULT_RULE_ID),
});

describe('compileToShader renderer contract', () => {
    it('emits identifiers the Glaze surface provides', () => {
        const shader = compileToShader({ seedText: 'glaze-contract', trees });

        expect(shader).toContain('in vec2 vUv;');
        expect(shader).toContain('uniform float u_clockTime;');
        expect(shader).not.toContain('v_texCoord');
        expect(shader).not.toContain('u_time');
    });

    it('keeps every behavior on the renderer contract', () => {
        for (const behavior of Object.values(BEHAVIORS)) {
            const shader = compileToShader({
                seedText: 'behavior-contract',
                trees,
                behaviors: [behavior],
            });

            expect(shader, behavior.id).not.toContain('v_texCoord');
            expect(shader, behavior.id).not.toContain('u_time');
        }
    });
});
