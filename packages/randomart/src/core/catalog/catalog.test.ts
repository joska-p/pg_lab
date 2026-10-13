import { describe, expect, it } from 'vite-plus/test';

import {
    createCatalog,
    createDefaultCatalog,
    defineDependency,
    defineOperator,
    formatGlslFloat,
} from './index.ts';

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

describe('defineOperator & defineDependency validation', () => {
    it('rejects operator with invalid name', () => {
        expect(() =>
            defineOperator({
                name: 'BadName',
                family: 'test',
                inputs: [],
                output: 'float',
                glsl: () => '0.0',
            }),
        ).toThrow(/Invalid operator name/);
    });

    it('rejects operator with min >= max in params', () => {
        expect(() =>
            defineOperator({
                name: 'bad_param',
                family: 'test',
                inputs: [],
                output: 'float',
                params: [{ name: 'v', min: 1, max: 0 }],
                glsl: () => '0.0',
            }),
        ).toThrow(/invalid range/);
    });

    it('rejects operator with inner scope without innerCoords', () => {
        expect(() =>
            defineOperator({
                name: 'bad_inner',
                family: 'test',
                inputs: [{ type: 'float', scope: 'inner' }],
                output: 'float',
                glsl: ([a]) => a,
            }),
        ).toThrow(/inner inputs but no innerCoords/);
    });

    it('rejects dependency with invalid name convention', () => {
        expect(() =>
            defineDependency({
                kind: 'uniform',
                name: 'phase',
                glslType: 'float',
            }),
        ).toThrow(/Invalid uniform dependency name/);

        expect(() =>
            defineDependency({
                kind: 'function',
                name: 'fold',
                code: '...',
            }),
        ).toThrow(/Invalid function dependency name/);
    });
});

describe('createCatalog', () => {
    it('rejects catalog without terminals', () => {
        const op = defineOperator({
            name: 'unary',
            family: 'test',
            inputs: [{ type: 'float' }],
            output: 'float',
            glsl: ([a]) => `-${a}`,
        });
        expect(() => createCatalog({ operators: [op] })).toThrow(/at least one terminal/);
    });

    it('rejects duplicate operator names', () => {
        const term1 = defineOperator({
            name: 'term',
            family: 'test',
            inputs: [],
            output: 'float',
            glsl: () => '1.0',
        });
        const term2 = defineOperator({
            name: 'term',
            family: 'test',
            inputs: [],
            output: 'float',
            glsl: () => '2.0',
        });
        expect(() => createCatalog({ operators: [term1, term2] })).toThrow(/Duplicate operator/);
    });

    it('rejects operator when an input is unused', () => {
        const term = defineOperator({
            name: 't',
            family: 'test',
            inputs: [],
            output: 'float',
            glsl: () => '1.0',
        });
        const badOp = defineOperator({
            name: 'bad',
            family: 'test',
            inputs: [{ type: 'float' }, { type: 'float' }],
            output: 'float',
            glsl: ([a]) => a, // b is omitted!
        });
        expect(() => createCatalog({ operators: [term, badOp] })).toThrow(/is never used/);
    });

    it('resolves dependency closure in topological order', () => {
        const depA = defineDependency({
            kind: 'function',
            name: 'ra_a',
            code: 'float ra_a() { return 1.0; }',
        });
        const depB = defineDependency({
            kind: 'function',
            name: 'ra_b',
            code: 'float ra_b() { return ra_a(); }',
            requires: ['ra_a'],
        });
        const term = defineOperator({
            name: 't',
            family: 'test',
            inputs: [],
            output: 'float',
            glsl: () => '1.0',
        });

        const catalog = createCatalog({
            operators: [term],
            dependencies: [depA, depB],
        });

        const closure = catalog.dependencyClosure(['ra_b']);
        expect(closure.map((d) => d.name)).toEqual(['ra_a', 'ra_b']);
    });
});

describe('createDefaultCatalog', () => {
    it('creates standard operators and default dependency', () => {
        const catalog = createDefaultCatalog();
        expect(catalog.operators().length).toBe(18);
        expect(
            catalog
                .terminals()
                .map((t) => t.name)
                .sort(),
        ).toEqual(['const', 'tcos', 'tsin', 'x', 'y']);
        expect(catalog.operator('x').family).toBe('terminal');
        expect(catalog.operator('add').inputs.length).toBe(2);
        expect(catalog.operator('mix').inputs.length).toBe(3);
        expect(catalog.operator('select').inputs.length).toBe(3);
        expect(() => catalog.operator('unknown')).toThrow(/Unknown operator/);
    });
});
