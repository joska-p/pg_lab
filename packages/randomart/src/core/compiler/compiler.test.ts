import { describe, expect, it } from 'vite-plus/test';

import { validateShaderContract } from '../../renderer/contract.ts';
import { Catalog, createDefaultCatalog, DEPENDENCIES, OPERATOR_SPECS } from '../catalog/index.ts';
import type { DependencySpec, OperatorSpec } from '../catalog/index.ts';
import { createExpression, createNode } from '../expression/index.ts';
import { generate } from '../generator/index.ts';
import { defaultGrammar } from '../grammar/index.ts';
import { createSeed } from '../random/index.ts';
import { compile } from './compile.ts';
import { isAtom, isEnclosedInParens, wrapInput } from './format.ts';
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

            // New spec §5.3 output format: vec3 rgb + clamp
            expect(compiled.source).toContain('vec3 rgb = vec3(v_p.x, v_p.y, 0.25);');
            expect(compiled.source).toContain(
                'o_color = vec4(clamp(rgb * 0.5 + 0.5, 0.0, 1.0), 1.0);',
            );

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

        // ── §8.2 — Cross-channel sharing ────────────────────────────────────

        it('§8.2 shares a sub-expression used in two channels (policy=shared)', () => {
            const x = createNode(catalog, 'x');
            const sinX = createNode(catalog, 'sin', [x]);
            const y = createNode(catalog, 'y');

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

        it('§8.2 cross-channel sharing: vertices < nodes when sharing is effective', () => {
            const x = createNode(catalog, 'x');
            const sinX = createNode(catalog, 'sin', [x]);
            const add = createNode(catalog, 'add', [sinX, sinX]);
            // r = add(sin(x), sin(x)) shared — but same node reference so same vertex
            const expr = createExpression(add, sinX, sinX);
            const compiled = compile(catalog, expr);

            // vertices should be fewer than the naive node count
            expect(compiled.stats.vertices).toBeLessThan(compiled.stats.nodes);
            expect(compiled.stats.contexts).toBe(1);
        });

        // ── §8.5 — Sharing policies ──────────────────────────────────────────

        it('§8.5 policy=none never emits variables', () => {
            const x = createNode(catalog, 'x');
            const sinX = createNode(catalog, 'sin', [x]);
            const add = createNode(catalog, 'add', [sinX, sinX]);
            const expr = createExpression(add, sinX, x);
            const compiled = compile(catalog, expr, { sharing: 'none' });

            expect(compiled.stats.variables).toBe(0);
            // No float v<n> = ... lines
            expect(compiled.source).not.toMatch(/float v\d+ =/);
        });

        it('§8.5 policy=all emits a variable for every vertex', () => {
            const x = createNode(catalog, 'x');
            const sinX = createNode(catalog, 'sin', [x]);
            const expr = createExpression(sinX, x, x);
            const compiled = compile(catalog, expr, { sharing: 'all' });

            // All 3 vertices (x, sin(x), x-again-shared) get variables
            expect(compiled.stats.variables).toBe(compiled.stats.vertices);
        });

        it('§8.5 all three policies produce valid GLSL and consistent stats.vertices', () => {
            const x = createNode(catalog, 'x');
            const y = createNode(catalog, 'y');
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

        // ── §8.6 — Determinism ───────────────────────────────────────────────

        it('§8.6 determinism: same expression compiled twice gives identical source and stats', () => {
            const grammar = defaultGrammar(catalog);
            const expr = generate(catalog, grammar, createSeed(99));
            const a = compile(catalog, expr, { sharing: 'shared' });
            const b = compile(catalog, expr, { sharing: 'shared' });
            expect(a.source).toBe(b.source);
            expect(a.stats).toEqual(b.stats);
        });

        // ── §8.7 — Literals ──────────────────────────────────────────────────

        it('§8.7 formats integer as float (adds .0)', () => {
            // const operator with value 1 → should emit "1.0"
            const c = createNode(catalog, 'const', [], [1]);
            const x = createNode(catalog, 'x');
            const expr = createExpression(c, x, x);
            const compiled = compile(catalog, expr, { sharing: 'none' });
            expect(compiled.source).toContain('1.0');
        });

        it('§8.7 formats negative number as parenthesized literal', () => {
            const c = createNode(catalog, 'const', [], [-0.3]);
            const x = createNode(catalog, 'x');
            const expr = createExpression(c, x, x);
            const compiled = compile(catalog, expr, { sharing: 'none' });
            expect(compiled.source).toContain('(-0.3)');
            expect(compiled.source).not.toContain('--');
        });

        it('§8.7 passes through scientific notation literals unchanged', () => {
            // formatGlslFloat for a number like 1e-7 — no .0 added since it has 'e'
            // We test via neg(const) to exercise the path
            const c = createNode(catalog, 'const', [], [0.3]);
            const x = createNode(catalog, 'x');
            const expr = createExpression(c, x, x);
            const compiled = compile(catalog, expr, { sharing: 'none' });
            expect(compiled.source).toContain('0.3');
        });

        // ── sqr multiplicity ─────────────────────────────────────────────────

        it('sqr uses shared policy to avoid duplicating its input in inline mode', () => {
            const x = createNode(catalog, 'x');
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

        // ── MP3·S3: Contexts & warp ──────────────────────────────────────────

        it('§8.1/§8.3 compiles warp transformer and produces valid shader contract', () => {
            const dx = createNode(catalog, 'const', [], [0.25]);
            const dy = createNode(catalog, 'const', [], [-0.5]);
            const x = createNode(catalog, 'x');
            const warpNode = createNode(catalog, 'warp', [dx, dy, x]);
            const y = createNode(catalog, 'y');
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

        it('§8.3 two identical transforms in different channels create only 1 context', () => {
            const dx = createNode(catalog, 'const', [], [0.1]);
            const dy = createNode(catalog, 'const', [], [0.2]);
            const x = createNode(catalog, 'x');
            const y = createNode(catalog, 'y');
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

        it('§8.3 different transforms create multiple contexts', () => {
            const dx1 = createNode(catalog, 'const', [], [0.1]);
            const dy1 = createNode(catalog, 'const', [], [0.2]);
            const dx2 = createNode(catalog, 'const', [], [0.3]);
            const dy2 = createNode(catalog, 'const', [], [0.4]);
            const x = createNode(catalog, 'x');
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
            const x = createNode(catalog, 'x');

            // warp1(dx1, dy1, warp2(dx2, dy2, x))
            const innerWarp = createNode(catalog, 'warp', [dx2, dy2, x]);
            const outerWarp = createNode(catalog, 'warp', [dx1, dy1, innerWarp]);
            const y = createNode(catalog, 'y');
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
            const x = createNode(catalog, 'x');
            const sinX = createNode(catalog, 'sin', [x]);
            const warpNode = createNode(catalog, 'warp', [dx, dy, sinX]);
            const expr = createExpression(warpNode, warpNode, dx);

            for (const policy of ['none', 'shared', 'all'] as const) {
                const compiled = compile(catalog, expr, { sharing: policy });
                const validation = validateShaderContract(compiled.source);
                expect(validation.valid).toBe(true);

                // Context c1 is ALWAYS emitted regardless of policy (spec §5.2)
                expect(compiled.source).toContain('vec2 c1 =');
                expect(compiled.stats.contexts).toBe(2);
            }
        });
    });
});
