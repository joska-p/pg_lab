import { describe, expect, it } from 'vite-plus/test';

import type { Features } from './computeFeatures';
import { buildPcaReport, formatPcaReport } from './pcaReport';
import type { GrammarInput } from './pcaReport';

function featuresFixture(): Features {
    const names = ['meanSaturation', 'contrast', 'flat'];

    return {
        names,
        rows: Array.from({ length: 6 }, (_, i) => ({
            grammar: i,
            valid: 5,
            mean: [0.1 * i, 0.9 - 0.1 * i, 0.5],
            std: [0.01 * i, 0.02 * i, 0.03],
        })),
    };
}

function grammarsFixture(): GrammarInput[] {
    return Array.from({ length: 6 }, (_, i) => ({
        weights: { sin: i / 5, cos: 1 - i / 5 },
        size: 'medium' as const,
        shareDepth: 2,
        space: 'oklch',
    }));
}

describe('buildPcaReport', () => {
    it('keeps the varying columns and explains the whole variance', () => {
        const report = buildPcaReport(featuresFixture(), grammarsFixture(), { std: false });

        // `flat` never varies: it cannot be standardized.
        expect(report.columns).toEqual(['meanSaturation', 'contrast']);
        expect(report.explained).toHaveLength(2);
        expect(report.explained[0] + report.explained[1]).toBeCloseTo(1);
        expect(report.grammars).toHaveLength(6);
        expect(report.grammars[0].scores).toHaveLength(2);
    });

    it('adds a spread column per descriptor with std', () => {
        const report = buildPcaReport(featuresFixture(), grammarsFixture(), { std: true });

        expect(report.columns).toContain('meanSaturation.std');
    });

    it('keeps one descriptor family with only', () => {
        const report = buildPcaReport(featuresFixture(), grammarsFixture(), {
            only: 'color',
            std: false,
        });

        expect(report.columns).toEqual(['meanSaturation']);
    });

    it('reports which grammars sit at the ends of a component', () => {
        const report = buildPcaReport(featuresFixture(), grammarsFixture(), { std: false });
        const { lowEnd, highEnd } = report.components[0];

        expect(lowEnd).toHaveLength(4);
        expect(highEnd).toHaveLength(4);
        expect(lowEnd).not.toEqual(highEnd);
    });

    it('refuses a feature table with nothing to explain', () => {
        const features = {
            names: ['flat'],
            rows: featuresFixture().rows.map((row) => ({ ...row, mean: [0.5], std: [0.03] })),
        };

        expect(() => buildPcaReport(features, grammarsFixture(), { std: false })).toThrow(
            /no varying column/,
        );
    });

    it('says when every grammar was dropped upstream', () => {
        const features = { names: ['meanSaturation'], rows: [] };

        expect(() => buildPcaReport(features, grammarsFixture(), { std: false })).toThrow(
            /empty feature table/,
        );
    });

    it('names the grammar it has no data for', () => {
        expect(() => buildPcaReport(featuresFixture(), [], { std: false })).toThrow(
            /dataset grammar 0/,
        );
    });
});

describe('formatPcaReport', () => {
    it('renders the report as the text the step prints', () => {
        const report = buildPcaReport(featuresFixture(), grammarsFixture(), { std: false });
        const text = formatPcaReport(report);

        expect(text).toContain('6 grammars × 2 columns');
        expect(text).toContain('PC1');
        expect(text).toContain('measures');
        expect(text).toContain('high end');
    });
});
