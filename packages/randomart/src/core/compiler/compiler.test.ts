import { describe, expect, it } from 'vite-plus/test';

import { validateShaderContract } from '../../renderer/contract.ts';
import {
    createCatalog,
    createDefaultCatalog,
    defineDependency,
    defineOperator,
} from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import { generate } from '../generator/index.ts';
import { staticGrammar } from '../grammar/index.ts';
import { createSeed } from '../random/index.ts';
import { compile, isAtom, isEnclosedInParens, wrapInput } from './compiler.ts';
import { MAX_SOURCE_LENGTH } from './types.ts';

describe('compiler', () => {
    describe('isAtom', () => {
        it('identifies identifiers and member accesses', () => {
            expect(isAtom('v_p.x')).toBe(true);
            expect(isAtom('v_p.y')).toBe(true);
            expect(isAtom('u_phase')).toBe(true);
            expect(isAtom('foo_bar')).toBe(true);
        });

        it('identifies positive number literals', () => {
            expect(isAtom('0.0')).toBe(true);
            expect(isAtom('1.5')).toBe(true);
            expect(isAtom('42')).toBe(true);
            expect(isAtom('1e-5')).toBe(true);
        });

        it('identifies parenthesized negative numbers', () => {
            expect(isAtom('(-1.0)')).toBe(true);
            expect(isAtom('(-0.5)')).toBe(true);
            expect(isAtom('(-1e-4)')).toBe(true);
        });

        it('rejects unparenthesized negative numbers, operations and function calls', () => {
            expect(isAtom('-1.0')).toBe(false);
            expect(isAtom('-0.5')).toBe(false);
            expect(isAtom('sin(PI*v_p.x)')).toBe(false);
            expect(isAtom('(v_p.x+v_p.y)*0.5')).toBe(false);
            expect(isAtom('a*b')).toBe(false);
        });
    });

    describe('isEnclosedInParens', () => {
        it('returns true when outer parentheses match the entire string', () => {
            expect(isEnclosedInParens('(a+b)')).toBe(true);
            expect(isEnclosedInParens('((a+b)*c)')).toBe(true);
            expect(isEnclosedInParens('(x > 0.0 ? 1.0 : -1.0)')).toBe(true);
        });

        it('returns false for expressions with multiple top-level parts', () => {
            expect(isEnclosedInParens('(a+b)*0.5')).toBe(false);
            expect(isEnclosedInParens('(a)+(b)')).toBe(false);
            expect(isEnclosedInParens('v_p.x')).toBe(false);
        });
    });

    describe('wrapInput', () => {
        it('leaves atoms unchanged', () => {
            expect(wrapInput('v_p.x')).toBe('v_p.x');
            expect(wrapInput('1.0')).toBe('1.0');
            expect(wrapInput('(-0.5)')).toBe('(-0.5)');
        });

        it('leaves already enclosed expressions unchanged', () => {
            expect(wrapInput('(a+b)')).toBe('(a+b)');
            expect(wrapInput('(x > y ? 1.0 : -1.0)')).toBe('(x > y ? 1.0 : -1.0)');
        });

        it('wraps non-atomic expressions in parentheses', () => {
            expect(wrapInput('sin(PI*v_p.x)')).toBe('(sin(PI*v_p.x))');
            expect(wrapInput('(a+b)*0.5')).toBe('((a+b)*0.5)');
            expect(wrapInput('-1.0')).toBe('(-1.0)');
        });
    });

    describe('compile', () => {
        const catalog = createDefaultCatalog();

        it('compiles a simple static terminal expression conforming to shader contract', () => {
            const x = createNode(catalog, 'x');
            const y = createNode(catalog, 'y');
            const c = createNode(catalog, 'const', [], [0.25]);

            const expr = createExpression(x, y, c);
            const compiled = compile(catalog, expr);

            // GLSL contract validation
            const validation = validateShaderContract(compiled.source);
            expect(validation.valid).toBe(true);
            expect(validation.errors).toEqual([]);

            // Contract snippets
            expect(compiled.source).toContain('precision highp float;');
            expect(compiled.source).toContain('in vec2 vUv;');
            expect(compiled.source).toContain('out vec4 o_color;');
            expect(compiled.source).toContain('uniform float u_phase;');
            expect(compiled.source).toContain('const float PI = 3.141592653589793;');
            expect(compiled.source).toContain('vec2 v_p = vUv * 2.0 - 1.0;');
            expect(compiled.source).toContain(
                'o_color = vec4(clamp(r_expr, 0.0, 1.0), clamp(g_expr, 0.0, 1.0), clamp(b_expr, 0.0, 1.0), 1.0);',
            );

            // Channels
            expect(compiled.source).toContain('float r_expr = (v_p.x) * 0.5 + 0.5;');
            expect(compiled.source).toContain('float g_expr = (v_p.y) * 0.5 + 0.5;');
            expect(compiled.source).toContain('float b_expr = (0.25) * 0.5 + 0.5;');

            // Metadata & stats
            expect(compiled.animated).toBe(false);
            expect(compiled.uniforms).toEqual([]);
            expect(compiled.stats).toEqual({
                nodes: 3,
                vertices: 3,
                variables: 0,
                contexts: 1,
                sourceLength: compiled.source.length,
            });
        });

        it('detects animation dependencies and reports u_phase in uniforms', () => {
            const tsin = createNode(catalog, 'tsin');
            const tcos = createNode(catalog, 'tcos');
            const x = createNode(catalog, 'x');

            const expr = createExpression(tsin, tcos, x);
            const compiled = compile(catalog, expr);

            expect(compiled.animated).toBe(true);
            expect(compiled.uniforms).toEqual([{ name: 'u_phase', glslType: 'float' }]);
            expect(compiled.source).toContain('sin(2.0*PI*u_phase)');
            expect(compiled.source).toContain('cos(2.0*PI*u_phase)');
        });

        it('handles operator nesting and protects against double negations (--)', () => {
            const negConst = createNode(catalog, 'const', [], [-0.5]);
            const negNode = createNode(catalog, 'neg', [negConst]);
            const doubleNeg = createNode(catalog, 'neg', [negNode]);
            const y = createNode(catalog, 'y');

            const expr = createExpression(doubleNeg, y, y);
            const compiled = compile(catalog, expr);

            // -0.5 is formatted as (-0.5). neg((-0.5)) -> -(-0.5). neg(-(-0.5)) -> -(-(-0.5))
            expect(compiled.source).not.toContain('--');
            expect(compiled.source).toContain('-(-(-0.5))');
        });

        it('correctly parenthesizes arithmetic compositions', () => {
            const x = createNode(catalog, 'x');
            const y = createNode(catalog, 'y');
            const add = createNode(catalog, 'add', [x, y]);
            const mul = createNode(catalog, 'mul', [add, x]);

            const expr = createExpression(mul, x, y);
            const compiled = compile(catalog, expr);

            // add is (v_p.x+v_p.y)*0.5 -> wrapped to ((v_p.x+v_p.y)*0.5) when multiplied by v_p.x
            expect(compiled.source).toContain('((v_p.x+v_p.y)*0.5)*v_p.x');
        });

        it('is completely deterministic', () => {
            const x = createNode(catalog, 'x');
            const y = createNode(catalog, 'y');
            const sin = createNode(catalog, 'sin', [x]);
            const expr = createExpression(sin, y, x);

            const compile1 = compile(catalog, expr);
            const compile2 = compile(catalog, expr);

            expect(compile1.source).toBe(compile2.source);
            expect(compile1.stats).toEqual(compile2.stats);
        });

        it('integrates with generate and staticGrammar', () => {
            const grammar = staticGrammar(catalog);
            const seed = createSeed(42);
            const expr = generate(catalog, grammar, seed);

            const compiled = compile(catalog, expr);
            const validation = validateShaderContract(compiled.source);

            expect(validation.valid).toBe(true);
            expect(compiled.stats.nodes).toBeGreaterThan(0);
            expect(compiled.stats.sourceLength).toBe(compiled.source.length);
        });

        it('emits function dependencies if present in catalog closure', () => {
            const helperFn = defineDependency({
                kind: 'function',
                name: 'ra_custom_noise',
                code: 'float ra_custom_noise(vec2 p) { return sin(p.x * 10.0); }',
            });

            const noiseOp = defineOperator({
                name: 'custom_noise',
                family: 'terminal',
                inputs: [],
                output: 'float',
                requires: ['ra_custom_noise'],
                glsl: (_in, _p, ctx) => `ra_custom_noise(${ctx.p})`,
            });

            const customCatalog = createCatalog({
                operators: [...catalog.operators(), noiseOp],
                dependencies: [
                    defineDependency({
                        kind: 'uniform',
                        name: 'u_phase',
                        glslType: 'float',
                    }),
                    helperFn,
                ],
            });

            const noiseNode = createNode(customCatalog, 'custom_noise');
            const x = createNode(customCatalog, 'x');
            const expr = createExpression(noiseNode, x, x);

            const compiled = compile(customCatalog, expr);
            expect(compiled.source).toContain(
                'float ra_custom_noise(vec2 p) { return sin(p.x * 10.0); }',
            );
            expect(compiled.source).toContain('ra_custom_noise(v_p)');
        });

        it('throws an error if source length exceeds MAX_SOURCE_LENGTH', () => {
            // Build a synthetic node whose emitted code exceeds MAX_SOURCE_LENGTH
            const longGlslOp = defineOperator({
                name: 'huge_op',
                family: 'terminal',
                inputs: [],
                output: 'float',
                glsl: () => `${'1.0 + '.repeat(Math.ceil(MAX_SOURCE_LENGTH / 6))}1.0`,
            });

            const testCatalog = createCatalog({
                operators: [...catalog.operators(), longGlslOp],
                dependencies: [
                    defineDependency({
                        kind: 'uniform',
                        name: 'u_phase',
                        glslType: 'float',
                    }),
                ],
            });

            const hugeNode = createNode(testCatalog, 'huge_op');
            const expr = createExpression(hugeNode, hugeNode, hugeNode);

            expect(() => compile(testCatalog, expr)).toThrow(/exceeds MAX_SOURCE_LENGTH/);
        });
    });
});
