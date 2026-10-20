import { describe, expect, it } from 'vite-plus/test';

import { Catalog, createDefaultCatalog } from './Catalog';
import { DEPENDENCIES } from './dependencies';
import type { DependencySpec } from './dependencies';
import { formatGlslFloat } from './format';
import { Operator } from './operators/Operator';
import { OPERATOR_SPECS } from './operators/registry';
import type { OperatorSpec } from './operators/types';

const countIn = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

const terminal = (code: string): OperatorSpec => ({
    label: 'Test terminal',
    group: 'terminal',
    glsl: () => code,
});

describe('formatGlslFloat', () => {
    it('formats positive integers with .0', () => {
        expect(formatGlslFloat(1)).toBe('1.0');
        expect(formatGlslFloat(0)).toBe('0.0');
    });

    it('formats floats as-is', () => {
        expect(formatGlslFloat(0.5)).toBe('0.5');
    });

    it('wraps negative numbers in parentheses', () => {
        expect(formatGlslFloat(-1)).toBe('(-1.0)');
        expect(formatGlslFloat(-0.5)).toBe('(-0.5)');
    });
});

describe('registry', () => {
    it('operator ids are lowercase identifiers', () => {
        for (const id of Object.keys(OPERATOR_SPECS)) {
            expect(id).toMatch(/^[a-z][a-z0-9_]*$/);
        }
    });

    it('dependency ids follow u_* / ra_*, and functions declare their own name', () => {
        for (const [id, dep] of Object.entries(DEPENDENCIES)) {
            expect(id).toMatch(dep.kind === 'uniform' ? /^u_[A-Za-z0-9_]+$/ : /^ra_[A-Za-z0-9_]+$/);
            expect(id).not.toContain('__');
            if (dep.kind === 'function') {
                expect(dep.code).toContain(`${id}(`);
            }
        }
    });

    it('every `requires` resolves, with no cycle', () => {
        const catalog = createDefaultCatalog();

        for (const operator of catalog.operators()) {
            expect(() => catalog.dependencyClosure(operator.requires)).not.toThrow();
        }

        // Stronger than the operators alone: a dependency nothing uses is still checked.
        for (const dependency of catalog.dependencies()) {
            expect(() => catalog.dependencyClosure([dependency.name])).not.toThrow();
        }
    });

    it('param ranges are non-empty', () => {
        for (const operator of createDefaultCatalog().operators()) {
            for (const param of operator.params) {
                expect(param.min).toBeLessThan(param.max);
            }
        }
    });
});

describe('Operator', () => {
    it('probes multiplicities once, at construction', () => {
        const catalog = createDefaultCatalog();

        expect(catalog.operator('sqr').multiplicity(0)).toBe(2);
        expect(catalog.operator('warp').multiplicity(0)).toBe(0);
        expect(catalog.operator('warp').coordsMultiplicity(0)).toBe(1);
        expect(catalog.operators()).toHaveLength(Object.keys(OPERATOR_SPECS).length);
    });

    it('rejects an unused input', () => {
        expect(
            () =>
                new Operator('bad', {
                    label: 'Bad',
                    group: 'arithmetic',
                    inputs: ['a', 'b'],
                    glsl: ({ args: { a } }) => a,
                }),
        ).toThrow(/never used/);
    });

    it('rejects `inner` without `coords`, and `coords` without `inner`', () => {
        expect(
            () =>
                new Operator('bad_inner', {
                    label: 'Bad inner',
                    group: 'transform',
                    inner: ['f'],
                    glsl: ({ args: { f } }) => f,
                }),
        ).toThrow(/`inner` and `coords` go together/);

        expect(
            () =>
                new Operator('bad_coords', {
                    label: 'Bad coords',
                    group: 'transform',
                    coords: ({ p }) => p,
                    glsl: () => '0.0',
                }),
        ).toThrow(/`inner` and `coords` go together/);
    });

    it('probes multiplicities independently of param values', () => {
        const catalog = createDefaultCatalog();

        for (const operator of catalog.operators()) {
            const sentinels = operator.inputNames.map((_, i) => `@${i}@`);
            const samples: number[][] = [];

            if (operator.params.length === 0) {
                samples.push([]);
            } else {
                samples.push(operator.params.map((param) => param.min));
                samples.push(operator.params.map((param) => param.max));
                samples.push(operator.params.map((param) => (param.min + param.max) / 2));
            }

            for (const params of samples) {
                const glslText = operator.glsl(sentinels, params, '@p@');
                expect(sentinels.map((sentinel) => countIn(glslText, sentinel))).toEqual(
                    sentinels.map((_, i) => operator.multiplicity(i)),
                );

                if (operator.hasInner) {
                    const currentSentinels = sentinels.slice(0, operator.currentCount);
                    const coordsText = operator.coords(currentSentinels, params, '@p@');
                    expect(
                        currentSentinels.map((sentinel) => countIn(coordsText, sentinel)),
                    ).toEqual(currentSentinels.map((_, i) => operator.coordsMultiplicity(i)));
                }
            }
        }
    });

    it('exposes a readable label, group and arity', () => {
        const catalog = createDefaultCatalog();
        const square = catalog.operator('sqr');

        expect(square.label).toBe('Square');
        expect(square.group).toBe('arithmetic');
        expect(square.arity).toBe(1);
        expect(square.isTerminal).toBe(false);
        expect(catalog.operator('x').isTerminal).toBe(true);
    });
});

describe('Catalog', () => {
    it('throws on an unknown operator', () => {
        expect(() => createDefaultCatalog().operator('unknown')).toThrow(/Unknown operator/);
    });

    it('resolves dependency closure in topological order', () => {
        const dependencies = {
            ra_a: { kind: 'function', code: 'float ra_a() { return 1.0; }' },
            ra_b: {
                kind: 'function',
                code: 'float ra_b() { return ra_a(); }',
                requires: ['ra_a'],
            },
        } satisfies Record<string, DependencySpec>;

        const catalog = new Catalog({ t: terminal('1.0') }, dependencies);

        expect(catalog.dependencyClosure(['ra_b']).map((d) => d.name)).toEqual(['ra_a', 'ra_b']);
    });

    it('throws on a dependency cycle', () => {
        const dependencies = {
            ra_a: {
                kind: 'function',
                code: 'float ra_a() { return ra_b(); }',
                requires: ['ra_b'],
            },
            ra_b: {
                kind: 'function',
                code: 'float ra_b() { return ra_a(); }',
                requires: ['ra_a'],
            },
        } satisfies Record<string, DependencySpec>;

        const catalog = new Catalog({ t: terminal('1.0') }, dependencies);

        expect(() => catalog.dependencyClosure(['ra_a'])).toThrow(/Dependency cycle/);
    });

    it('accepts a custom catalog without touching the default registry', () => {
        const triple: OperatorSpec = {
            label: 'Triple use',
            group: 'arithmetic',
            inputs: ['a'],
            glsl: ({ args: { a } }) => `(${a} * ${a} + ${a})`,
        };

        const catalog = new Catalog({ t: terminal('1.0'), triple }, DEPENDENCIES);

        expect(catalog.operator('triple').multiplicity(0)).toBe(3);
    });
});

describe('createDefaultCatalog', () => {
    it('exposes the default vocabulary', () => {
        const catalog = createDefaultCatalog();

        expect(
            catalog
                .terminals()
                .map((t) => t.name)
                .sort(),
        ).toEqual(['const', 'x', 'y']);
        expect(catalog.operator('x').group).toBe('terminal');
        expect(catalog.operator('add').arity).toBe(2);
        expect(catalog.operator('mix').arity).toBe(3);
        expect(catalog.operator('select').arity).toBe(3);
        expect(catalog.operator('warp').group).toBe('transform');
        expect(catalog.operator('warp').requires).toEqual(['ra_fold2']);
    });
});
