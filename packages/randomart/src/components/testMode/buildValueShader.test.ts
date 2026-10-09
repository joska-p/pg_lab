import { describe, expect, it } from 'vite-plus/test';

import type { Node } from '../../core';
import { buildValueFragmentShader } from './buildValueShader';

// The value shader is fed to `@repo/glaze/react/GpuCanvas`, whose fullscreen
// vertex shader emits `vUv` and whose surface clock drives `u_clockTime`.
const oscillating: Node = {
    type: 'osc',
    args: { value: { type: 'radial', args: {} } },
};

describe('buildValueFragmentShader renderer contract', () => {
    it('emits identifiers the Glaze surface provides', () => {
        const shader = buildValueFragmentShader(oscillating);

        expect(shader).toContain('in vec2 vUv;');
        expect(shader).toContain('uniform float u_clockTime;');
        expect(shader).toContain('u_clockTime');
        expect(shader).not.toContain('v_texCoord');
        expect(shader).not.toContain('u_time');
    });

    it('embeds the compiled expression over the normalized coordinate', () => {
        const shader = buildValueFragmentShader(oscillating);

        expect(shader).toContain('vec2 p = vUv * 2.0 - 1.0;');
        expect(shader).toContain('length(p)');
    });
});
