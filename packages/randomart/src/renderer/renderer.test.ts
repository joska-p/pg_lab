import { describe, expect, it } from 'vite-plus/test';

import {
    createPhase,
    DEFAULT_CONTEXT_OPTIONS,
    DEFAULT_LOOP_DURATION,
    GLSL_COORD_INIT,
    GLSL_IN_UV,
    GLSL_OUT_COLOR,
    HANDWRITTEN_TEST_SHADER,
    validateShaderContract,
} from './contract';

describe('renderer / contract & helpers', () => {
    describe('createPhase', () => {
        it('maps progress values strictly into [0, 1)', () => {
            expect(createPhase(0)).toBe(0);
            expect(createPhase(0.25)).toBe(0.25);
            expect(createPhase(0.5)).toBe(0.5);
            expect(createPhase(0.75)).toBe(0.75);
            // 1.0 wraps back to 0 (Clock.progress is [0, 1] inclusive)
            expect(createPhase(1)).toBe(0);
            // Values beyond 1 wrap properly
            expect(createPhase(1.25)).toBeCloseTo(0.25);
            expect(createPhase(2.0)).toBe(0);
        });

        it('handles negative progress values gracefully', () => {
            expect(createPhase(-0.25)).toBeCloseTo(0.75);
            expect(createPhase(-1)).toBe(0);
        });

        it('never returns >= 1 even with edge cases', () => {
            expect(createPhase(0.9999999999999999)).toBeLessThan(1);
            expect(createPhase(0.9999999999999999)).toBeGreaterThanOrEqual(0);
        });

        it('rejects a non-finite progress: fail loudly, do not propagate a NaN', () => {
            expect(() => createPhase(Number.NaN)).toThrow(
                'Randomart: clock progress must be a finite number, received NaN',
            );
        });
    });

    describe('GLSL contract validation', () => {
        it('validates the handwritten test shader successfully', () => {
            const result = validateShaderContract(HANDWRITTEN_TEST_SHADER);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('rejects shaders containing #version', () => {
            const invalidSource = `#version 300 es\n${HANDWRITTEN_TEST_SHADER}`;
            const result = validateShaderContract(invalidSource);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                'Fragment shader must not specify #version (glaze automatically injects it).',
            );
        });

        it('rejects shaders missing in vec2 vUv', () => {
            const invalidSource = HANDWRITTEN_TEST_SHADER.replace(GLSL_IN_UV, '');
            const result = validateShaderContract(invalidSource);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(`Fragment shader must declare input "${GLSL_IN_UV}".`);
        });

        it('rejects shaders missing out vec4 o_color', () => {
            const invalidSource = HANDWRITTEN_TEST_SHADER.replace(GLSL_OUT_COLOR, '');
            const result = validateShaderContract(invalidSource);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                `Fragment shader must declare output "${GLSL_OUT_COLOR}".`,
            );
        });

        it('rejects shaders missing vec2 v_p coordinate initialization', () => {
            const invalidSource = HANDWRITTEN_TEST_SHADER.replace(GLSL_COORD_INIT, '');
            const result = validateShaderContract(invalidSource);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                `Fragment shader must initialize "${GLSL_COORD_INIT}" at beginning of main.`,
            );
        });
    });

    describe('handwritten test shader', () => {
        it('references v_p.x, v_p.y, and u_phase', () => {
            expect(HANDWRITTEN_TEST_SHADER).toContain('v_p.x');
            expect(HANDWRITTEN_TEST_SHADER).toContain('v_p.y');
            expect(HANDWRITTEN_TEST_SHADER).toContain('u_phase');
        });

        it('has precision highp float', () => {
            expect(HANDWRITTEN_TEST_SHADER).toContain('precision highp float;');
        });
    });

    describe('defaults', () => {
        it('has an 8-second default duration', () => {
            expect(DEFAULT_LOOP_DURATION).toBe(8);
        });

        it('configures antialias false and preserveDrawingBuffer true', () => {
            expect(DEFAULT_CONTEXT_OPTIONS.antialias).toBe(false);
            expect(DEFAULT_CONTEXT_OPTIONS.preserveDrawingBuffer).toBe(true);
        });
    });
});
