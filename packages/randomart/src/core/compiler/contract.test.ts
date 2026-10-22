import { describe, expect, it } from 'vite-plus/test';

import { GLSL_COORD_INIT, GLSL_IN_UV, GLSL_OUT_COLOR } from './constants';

/**
 * Validates that a fragment shader adheres to the GLSL contract:
 *
 * - Does NOT contain #version directive (handled by glaze)
 * - Contains input `in vec2 vUv;`
 * - Contains output `out vec4 o_color;`
 * - Initializes `vec2 v_p = vUv * 2.0 - 1.0;`
 */
export function validateShaderContract(source: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (/^\s*#version/m.test(source)) {
        errors.push('Fragment shader must not specify #version (glaze automatically injects it).');
    }
    if (!source.includes(GLSL_IN_UV)) {
        errors.push(`Fragment shader must declare input "${GLSL_IN_UV}".`);
    }
    if (!source.includes(GLSL_OUT_COLOR)) {
        errors.push(`Fragment shader must declare output "${GLSL_OUT_COLOR}".`);
    }
    if (!source.includes(GLSL_COORD_INIT)) {
        errors.push(`Fragment shader must initialize "${GLSL_COORD_INIT}" at beginning of main.`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

const SAMPLE_CONTRACT_SHADER = `
in vec2 vUv;
out vec4 o_color;
void main() {
    vec2 v_p = vUv * 2.0 - 1.0;
    o_color = vec4(v_p, 0.0, 1.0);
}
`;

describe('GLSL contract validation', () => {
    it('validates a contract-compliant shader successfully', () => {
        const result = validateShaderContract(SAMPLE_CONTRACT_SHADER);
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
    });

    it('rejects shaders containing #version', () => {
        const invalidSource = `#version 300 es\n${SAMPLE_CONTRACT_SHADER}`;
        const result = validateShaderContract(invalidSource);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
            'Fragment shader must not specify #version (glaze automatically injects it).',
        );
    });

    it('rejects shaders missing in vec2 vUv', () => {
        const invalidSource = SAMPLE_CONTRACT_SHADER.replace(GLSL_IN_UV, '');
        const result = validateShaderContract(invalidSource);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`Fragment shader must declare input "${GLSL_IN_UV}".`);
    });

    it('rejects shaders missing out vec4 o_color', () => {
        const invalidSource = SAMPLE_CONTRACT_SHADER.replace(GLSL_OUT_COLOR, '');
        const result = validateShaderContract(invalidSource);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`Fragment shader must declare output "${GLSL_OUT_COLOR}".`);
    });

    it('rejects shaders missing vec2 v_p coordinate initialization', () => {
        const invalidSource = SAMPLE_CONTRACT_SHADER.replace(GLSL_COORD_INIT, '');
        const result = validateShaderContract(invalidSource);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
            `Fragment shader must initialize "${GLSL_COORD_INIT}" at beginning of main.`,
        );
    });
});
