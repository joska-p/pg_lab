import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import { compile } from './compile.ts';
import { checkShaderStructure, usesOperator } from './testing.ts';

const GOOD = `precision highp float;

in vec2 vUv;
out vec4 o_color;

uniform float u_phase;

const float PI = 3.141592653589793;

void main() {
  vec2 v_p = vUv * 2.0 - 1.0;

  float v1 = sin(PI*v_p.x);
  vec3 rgb = vec3(v1, (v1+v_p.y)*0.5, sin(2.0*PI*u_phase));
  o_color = vec4(clamp(rgb * 0.5 + 0.5, 0.0, 1.0), 1.0);
}`;

describe('checkShaderStructure', () => {
    it('accepts a well-formed shader', () => {
        expect(checkShaderStructure(GOOD)).toEqual([]);
    });

    it('flags "--"', () => {
        expect(checkShaderStructure(GOOD.replace('sin(PI*v_p.x)', '-(-0.3)--0.3'))).toContain(
            'contains "--"',
        );
    });

    it('flags unbalanced parentheses and braces', () => {
        expect(
            checkShaderStructure(GOOD.replace('sin(2.0*PI*u_phase))', 'sin(2.0*PI*u_phase)')),
        ).toContain('unclosed "("');
        expect(checkShaderStructure(`${GOOD}\n}`)).toContain('unbalanced "}"');
    });

    it('flags a variable used before its declaration', () => {
        const bad = GOOD.replace(
            '  float v1 = sin(PI*v_p.x);',
            '  float v2 = v1 + 1.0;\n  float v1 = sin(PI*v_p.x);',
        );

        expect(checkShaderStructure(bad)).toContain('v1 used before its declaration');
    });

    it('flags a double declaration', () => {
        const bad = GOOD.replace(
            '  float v1 = sin(PI*v_p.x);',
            '  float v1 = sin(PI*v_p.x);\n  float v1 = 0.0;',
        );

        expect(checkShaderStructure(bad)).toContain('v1 declared twice');
    });

    it('flags an integer literal but not floats or exponents', () => {
        expect(checkShaderStructure(GOOD.replace('0.0, 1.0), 1.0', '0, 1.0), 1.0'))).toEqual(
            expect.arrayContaining([expect.stringContaining('integer literal "0"')]),
        );
        expect(checkShaderStructure(GOOD.replace('* 0.5 + 0.5', '* 1e-7 + 0.5'))).toEqual([]);
    });

    it('flags an undeclared uniform', () => {
        expect(checkShaderStructure(GOOD.replace('uniform float u_phase;', ''))).toContain(
            'uniform u_phase used but not declared',
        );
    });
});

describe('real compiler output', () => {
    const catalog = createDefaultCatalog();

    it('passes the structural check on a compiled expression', () => {
        const x = createNode(catalog, 'x');
        const y = createNode(catalog, 'y');
        const sinX = createNode(catalog, 'sin', [x]);
        const add = createNode(catalog, 'add', [sinX, y]);
        const compiled = compile(catalog, createExpression(sinX, add, x), { motion: 'drift' });

        expect(checkShaderStructure(compiled.source)).toEqual([]);
    });
});

describe('usesOperator', () => {
    const catalog = createDefaultCatalog();

    it('finds an operator anywhere in the tree', () => {
        const x = createNode(catalog, 'x');
        const sqr = createNode(catalog, 'sqr', [x]);
        const tree = createNode(catalog, 'neg', [createNode(catalog, 'sin', [sqr])]);

        expect(usesOperator(tree, new Set(['sqr', 'cos']))).toBe(true);
        expect(usesOperator(tree, new Set(['warp']))).toBe(false);
    });
});
