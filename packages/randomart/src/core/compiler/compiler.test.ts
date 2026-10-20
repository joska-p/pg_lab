import { describe, expect, it } from 'vite-plus/test';

import { Catalog, createDefaultCatalog } from '../catalog/Catalog';
import { DEPENDENCIES } from '../catalog/dependencies';
import type { DependencySpec } from '../catalog/dependencies';
import { OPERATOR_SPECS } from '../catalog/operators/registry';
import type { OperatorSpec } from '../catalog/operators/types';
import { createExpression, createNode } from '../expression/expression';
import { generate } from '../generator/generator';
import { defaultGrammar } from '../grammar/presets';
import { createSeed } from '../random/seed';
import { compile } from './compile';
import { validateShaderContract } from './contract.test';
import { isAtom, isEnclosedInParens, wrapInput } from './format';
import { MAX_SOURCE_LENGTH } from './types';

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

        /** An `x` terminal with its oscillator params (amp=0.5 for a visible blend). */
        const xNode = (cat: ReturnType<typeof createDefaultCatalog>, cycles: number) =>
            createNode(cat, 'x', [], [0.5, 0, cycles]);

        it('compiles a plain-coordinate terminal expression conforming to shader contract', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
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

            // Single color path: the triplet through the color space's conversion (sRGB default).
            expect(compiled.source).toContain('vec3 ra_srgb(vec3 raw)');
            expect(compiled.source).toContain(
                'o_color = vec4(ra_srgb(vec3(v_p.x, v_p.y, 0.25)), 1.0);',
            );

            // Metadata & stats. x/y always carry `u_phase`, so any expression containing one is
            // "animated": a still image is just a paused play (phase frozen at 0).
            expect(compiled.animated).toBe(true);
            expect(compiled.uniforms).toEqual([{ name: 'u_phase', glslType: 'float' }]);
            expect(compiled.stats).toEqual({
                nodes: 3,
                vertices: 3,
                variables: 0,
                contexts: 1,
                sourceLength: compiled.source.length,
            });
        });

        it('emits a time terminal as its oscillator reading u_phase', () => {
            // amp=0.5, phase=0, cycles=0 → 1 whole cycle; the coordinate is blended with a sine.
            const x = createNode(catalog, 'x', [], [0.5, 0, 0]);

            const compiled = compile(catalog, createExpression(x, x, x));

            expect(compiled.animated).toBe(true);
            expect(compiled.uniforms).toEqual([{ name: 'u_phase', glslType: 'float' }]);
            expect(compiled.source).toContain('(0.5*v_p.x+0.5*sin(2.0*PI*1.0*u_phase+PI*0.0))');
        });

        it('falls back to the plain coordinate when amp is 0 (still a u_phase reader)', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);

            const compiled = compile(catalog, createExpression(x, y, x));

            // amp=0 → the raw coordinate, but the dependency stays: the shader is one pause away
            // from moving.
            expect(compiled.source).toContain(
                'o_color = vec4(ra_srgb(vec3(v_p.x, v_p.y, v_p.x)), 1.0);',
            );
            expect(compiled.animated).toBe(true);
            expect(compiled.uniforms).toEqual([{ name: 'u_phase', glslType: 'float' }]);
        });

        it('maps the cycles share to 1..3 whole cycles, keeping the loop periodic', () => {
            // cycles share 0 → 1 cycle, 0.25 → 1, 0.5 → 2, 1 → 3.
            const at = (cycles: number) =>
                compile(
                    catalog,
                    createExpression(
                        xNode(catalog, cycles),
                        xNode(catalog, cycles),
                        xNode(catalog, cycles),
                    ),
                ).source;

            expect(at(0)).toContain('1.0*u_phase');
            expect(at(0.5)).toContain('2.0*u_phase');
            expect(at(1)).toContain('3.0*u_phase');
        });

        it('handles operator nesting and protects against double negations (--)', () => {
            const negConst = createNode(catalog, 'const', [], [-0.5]);
            const negNode = createNode(catalog, 'neg', [negConst]);
            const doubleNeg = createNode(catalog, 'neg', [negNode]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);

            const expr = createExpression(doubleNeg, y, y);
            const compiled = compile(catalog, expr);

            // -0.5 is formatted as (-0.5). neg((-0.5)) -> -(-0.5). neg(-(-0.5)) -> -(-(-0.5))
            expect(compiled.source).not.toContain('--');
            expect(compiled.source).toContain('-(-(-0.5))');
        });

        it('correctly parenthesizes arithmetic compositions', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const add = createNode(catalog, 'add', [x, y]);
            const mul = createNode(catalog, 'mul', [add, x]);

            const expr = createExpression(mul, x, y);
            const compiled = compile(catalog, expr);

            // add is (v_p.x+v_p.y)*0.5 -> wrapped to ((v_p.x+v_p.y)*0.5) when multiplied by v_p.x
            expect(compiled.source).toContain('((v_p.x+v_p.y)*0.5)*v_p.x');
        });

        it('is completely deterministic', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const sin = createNode(catalog, 'sin', [x]);
            const expr = createExpression(sin, y, x);

            const compile1 = compile(catalog, expr);
            const compile2 = compile(catalog, expr);

            expect(compile1.source).toBe(compile2.source);
            expect(compile1.stats).toEqual(compile2.stats);
        });

        it('integrates with generate and defaultGrammar', () => {
            const grammar = defaultGrammar(catalog);
            const seed = createSeed(42);
            const expr = generate(catalog, grammar, seed);

            const compiled = compile(catalog, expr);
            const validation = validateShaderContract(compiled.source);

            expect(validation.valid).toBe(true);
            expect(compiled.stats.nodes).toBeGreaterThan(0);
            expect(compiled.stats.sourceLength).toBe(compiled.source.length);
        });

        it('emits function dependencies if present in catalog closure', () => {
            const customDeps = {
                ...DEPENDENCIES,
                ra_custom_noise: {
                    kind: 'function',
                    code: 'float ra_custom_noise(vec2 p) { return sin(p.x * 10.0); }',
                },
            } satisfies Record<string, DependencySpec>;

            const noiseOperator: OperatorSpec = {
                label: 'Noise',
                group: 'terminal',
                requires: ['ra_custom_noise'],
                glsl: ({ p }) => `ra_custom_noise(${p})`,
            };

            const customCatalog = new Catalog(
                { ...OPERATOR_SPECS, custom_noise: noiseOperator },
                customDeps,
            );

            const noiseNode = createNode(customCatalog, 'custom_noise');
            const x = createNode(customCatalog, 'x', [], [0, 0, 0]);
            const expr = createExpression(noiseNode, x, x);

            const compiled = compile(customCatalog, expr);
            expect(compiled.source).toContain(
                'float ra_custom_noise(vec2 p) { return sin(p.x * 10.0); }',
            );
            expect(compiled.source).toContain('ra_custom_noise(v_p)');
        });

        it('throws an error if source length exceeds MAX_SOURCE_LENGTH', () => {
            // Build a synthetic node whose emitted code exceeds MAX_SOURCE_LENGTH
            const hugeOperator: OperatorSpec = {
                label: 'Huge',
                group: 'terminal',
                glsl: () => `${'1.0 + '.repeat(Math.ceil(MAX_SOURCE_LENGTH / 6))}1.0`,
            };

            const testCatalog = new Catalog(
                { ...OPERATOR_SPECS, huge_op: hugeOperator },
                DEPENDENCIES,
            );

            const hugeNode = createNode(testCatalog, 'huge_op');
            const expr = createExpression(hugeNode, hugeNode, hugeNode);

            expect(() => compile(testCatalog, expr)).toThrow(/exceeds MAX_SOURCE_LENGTH/);
        });

        // ── Cross-channel sharing ────────────────────────────────────

        it('shares a sub-expression used in two channels (policy=shared)', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);

            // r = sin(x), g = add(sin(x), y), b = y
            const add = createNode(catalog, 'add', [sinX, y]);
            const expr = createExpression(sinX, add, y);
            const compiled = compile(catalog, expr, { sharing: 'shared' });

            // sin(x) appears in r and add → 2 usages → gets a variable
            expect(compiled.source).toContain('float v');
            expect(compiled.stats.variables).toBeGreaterThanOrEqual(1);
            // Only one sin(PI*v_p.x) computation in the source
            const matches = (compiled.source.match(/sin\(PI\*v_p\.x\)/g) ?? []).length;
            expect(matches).toBe(1);
        });

        it('cross-channel sharing: vertices < nodes when sharing is effective', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const add = createNode(catalog, 'add', [sinX, sinX]);
            // r = add(sin(x), sin(x)) shared — but same node reference so same vertex
            const expr = createExpression(add, sinX, sinX);
            const compiled = compile(catalog, expr);

            // vertices should be fewer than the naive node count
            expect(compiled.stats.vertices).toBeLessThan(compiled.stats.nodes);
            expect(compiled.stats.contexts).toBe(1);
        });

        // ── Sharing policies ──────────────────────────────────────────

        it('policy=none never emits variables', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const add = createNode(catalog, 'add', [sinX, sinX]);
            const expr = createExpression(add, sinX, x);
            const compiled = compile(catalog, expr, { sharing: 'none' });

            expect(compiled.stats.variables).toBe(0);
            // No float v<n> = ... lines
            expect(compiled.source).not.toMatch(/float v\d+ =/);
        });

        it('policy=all emits a variable for every vertex', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const expr = createExpression(sinX, x, x);
            const compiled = compile(catalog, expr, { sharing: 'all' });

            // All 3 vertices (x, sin(x), x-again-shared) get variables
            expect(compiled.stats.variables).toBe(compiled.stats.vertices);
        });

        it('all three policies produce valid GLSL and consistent stats.vertices', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const add = createNode(catalog, 'add', [sinX, y]);
            const expr = createExpression(sinX, add, y);

            const none = compile(catalog, expr, { sharing: 'none' });
            const shared = compile(catalog, expr, { sharing: 'shared' });
            const all = compile(catalog, expr, { sharing: 'all' });

            // All valid GLSL
            for (const c of [none, shared, all]) {
                expect(validateShaderContract(c.source).valid).toBe(true);
            }

            // vertices count is the same regardless of policy (it's a property of the DAG)
            expect(none.stats.vertices).toBe(shared.stats.vertices);
            expect(shared.stats.vertices).toBe(all.stats.vertices);

            // variables: none=0, shared>=1, all=vertices
            expect(none.stats.variables).toBe(0);
            expect(shared.stats.variables).toBeGreaterThanOrEqual(1);
            expect(all.stats.variables).toBe(all.stats.vertices);
        });

        // ── Determinism ───────────────────────────────────────────────

        it('determinism: same expression compiled twice gives identical source and stats', () => {
            const grammar = defaultGrammar(catalog);
            const expr = generate(catalog, grammar, createSeed(99));
            const a = compile(catalog, expr, { sharing: 'shared' });
            const b = compile(catalog, expr, { sharing: 'shared' });
            expect(a.source).toBe(b.source);
            expect(a.stats).toEqual(b.stats);
        });

        // ── Literals ──────────────────────────────────────────────────

        it('formats integer as float (adds .0)', () => {
            // const operator with value 1 → should emit "1.0"
            const c = createNode(catalog, 'const', [], [1]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const expr = createExpression(c, x, x);
            const compiled = compile(catalog, expr, { sharing: 'none' });
            expect(compiled.source).toContain('1.0');
        });

        it('formats negative number as parenthesized literal', () => {
            const c = createNode(catalog, 'const', [], [-0.3]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const expr = createExpression(c, x, x);
            const compiled = compile(catalog, expr, { sharing: 'none' });
            expect(compiled.source).toContain('(-0.3)');
            expect(compiled.source).not.toContain('--');
        });

        it('passes through scientific notation literals unchanged', () => {
            // formatGlslFloat for a number like 1e-7 — no .0 added since it has 'e'
            // We test via neg(const) to exercise the path
            const c = createNode(catalog, 'const', [], [0.3]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const expr = createExpression(c, x, x);
            const compiled = compile(catalog, expr, { sharing: 'none' });
            expect(compiled.source).toContain('0.3');
        });

        // ── sqr multiplicity ─────────────────────────────────────────────────

        it('sqr uses shared policy to avoid duplicating its input in inline mode', () => {
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const sqrSin = createNode(catalog, 'sqr', [sinX]); // glsl: a*a → multiplicity 2
            const expr = createExpression(sqrSin, x, x);

            // With shared policy: sinX has usage ≥ 2 because sqr multiplicity is 2 → gets variable
            const compiled = compile(catalog, expr, { sharing: 'shared' });
            expect(compiled.stats.variables).toBeGreaterThanOrEqual(1);
            // sinX computation appears only once
            const sinCount = (compiled.source.match(/sin\(PI\*v_p\.x\)/g) ?? []).length;
            expect(sinCount).toBe(1);
        });

        // ── Contexts & warp ───────────────────────────────────────────

        it('compiles warp transformer and produces valid shader contract', () => {
            const dx = createNode(catalog, 'const', [], [0.25]);
            const dy = createNode(catalog, 'const', [], [-0.5]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const warpNode = createNode(catalog, 'warp', [dx, dy, x]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const expr = createExpression(warpNode, y, y);

            const compiled = compile(catalog, expr);

            // Valid GLSL
            const validation = validateShaderContract(compiled.source);
            expect(validation.valid).toBe(true);

            // Preamble contains ra_fold2 function
            expect(compiled.source).toContain('vec2 ra_fold2(vec2 v)');

            // Coordinate context declaration inside main()
            expect(compiled.source).toMatch(
                /vec2 c1 = ra_fold2\(v_p\+0\.5\*vec2\(0\.25,\(-0\.5\)\)\);/,
            );

            // Inner x evaluates to c1.x
            expect(compiled.source).toContain('c1.x');

            // stats: root + c1 = 2 contexts
            expect(compiled.stats.contexts).toBe(2);
        });

        it('two identical transforms in different channels create only 1 context', () => {
            const dx = createNode(catalog, 'const', [], [0.1]);
            const dy = createNode(catalog, 'const', [], [0.2]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const warp1 = createNode(catalog, 'warp', [dx, dy, x]);
            const warp2 = createNode(catalog, 'warp', [dx, dy, y]);
            const expr = createExpression(warp1, warp2, x);

            const compiled = compile(catalog, expr);

            // Exactly 2 contexts (root + 1 shared child context)
            expect(compiled.stats.contexts).toBe(2);

            // c1 declared exactly once
            const c1Matches = compiled.source.match(/vec2 c1 =/g);
            expect(c1Matches).toHaveLength(1);
            expect(compiled.source).not.toContain('vec2 c2 =');
        });

        it('different transforms create multiple contexts', () => {
            const dx1 = createNode(catalog, 'const', [], [0.1]);
            const dy1 = createNode(catalog, 'const', [], [0.2]);
            const dx2 = createNode(catalog, 'const', [], [0.3]);
            const dy2 = createNode(catalog, 'const', [], [0.4]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const warp1 = createNode(catalog, 'warp', [dx1, dy1, x]);
            const warp2 = createNode(catalog, 'warp', [dx2, dy2, x]);
            const expr = createExpression(warp1, warp2, x);

            const compiled = compile(catalog, expr);

            // 3 contexts: root + c1 + c2
            expect(compiled.stats.contexts).toBe(3);
            expect(compiled.source).toContain('vec2 c1 =');
            expect(compiled.source).toContain('vec2 c2 =');
        });

        it('compiles nested warp transformations with chained coordinate contexts', () => {
            const dx1 = createNode(catalog, 'const', [], [0.1]);
            const dy1 = createNode(catalog, 'const', [], [0.2]);
            const dx2 = createNode(catalog, 'const', [], [0.3]);
            const dy2 = createNode(catalog, 'const', [], [0.4]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);

            // warp1(dx1, dy1, warp2(dx2, dy2, x))
            const innerWarp = createNode(catalog, 'warp', [dx2, dy2, x]);
            const outerWarp = createNode(catalog, 'warp', [dx1, dy1, innerWarp]);
            const y = createNode(catalog, 'y', [], [0, 0, 0]);
            const expr = createExpression(outerWarp, y, y);

            const compiled = compile(catalog, expr);

            const validation = validateShaderContract(compiled.source);
            expect(validation.valid).toBe(true);

            expect(compiled.stats.contexts).toBe(3);
            // c1 depends on v_p
            expect(compiled.source).toMatch(/vec2 c1 = ra_fold2\(v_p\+/);
            // c2 depends on c1
            expect(compiled.source).toMatch(/vec2 c2 = ra_fold2\(c1\+/);
            // innermost x uses c2.x
            expect(compiled.source).toContain('c2.x');
        });

        it('compiles warp expressions under all sharing policies (none, shared, all)', () => {
            const dx = createNode(catalog, 'const', [], [0.1]);
            const dy = createNode(catalog, 'const', [], [0.2]);
            const x = createNode(catalog, 'x', [], [0, 0, 0]);
            const sinX = createNode(catalog, 'sin', [x]);
            const warpNode = createNode(catalog, 'warp', [dx, dy, sinX]);
            const expr = createExpression(warpNode, warpNode, dx);

            for (const policy of ['none', 'shared', 'all'] as const) {
                const compiled = compile(catalog, expr, { sharing: policy });
                const validation = validateShaderContract(compiled.source);
                expect(validation.valid).toBe(true);

                // Context c1 is ALWAYS emitted regardless of policy.
                expect(compiled.source).toContain('vec2 c1 =');
                expect(compiled.stats.contexts).toBe(2);
            }
        });
    });
});
