import { correlation } from '../../src/core/analysis/correlation';
import { pca } from '../../src/core/analysis/pca';
import type { SizeProfileId } from '../../src/core/config/config';
import { constraintsOf } from '../../src/core/grammar/grammar';
import type { FeatureRow, Features } from './computeFeatures';

/** What a grammar was made of: operator weights, its size profile, share depth and vocabulary. */
export interface GrammarInput {
    readonly weights: Readonly<Record<string, number>>;
    readonly size: SizeProfileId;
    readonly shareDepth: number;
    readonly space: string;
}

export interface PcaOptions {
    /** Keep only the structure descriptors, or only the color ones. */
    readonly only?: 'structure' | 'color';
    /** Also use the per-grammar spread as a column. */
    readonly std: boolean;
}

interface PcaComponent {
    /** Strongest descriptor loadings of this component. */
    readonly loadings: readonly { readonly label: string; readonly value: number }[];
    /** Grammar parameters tracking this component, by correlation. */
    readonly links: readonly { readonly label: string; readonly r: number }[];
    /** Dataset grammar indices at the low and high end of this component. */
    readonly lowEnd: readonly number[];
    readonly highEnd: readonly number[];
}

/** Where the PCA lands: the columns it ran on, and what each component was made of. */
export interface PcaReport {
    readonly columns: readonly string[];
    readonly explained: readonly number[];
    readonly components: readonly PcaComponent[];
    readonly grammars: readonly {
        readonly grammar: number;
        readonly scores: readonly number[];
    }[];
}

const COLOR = new Set([
    'meanSaturation',
    'stdSaturation',
    'hueConcentration',
    'channelCorrelation',
    'colorfulness',
]);
const COMPONENTS_SHOWN = 4;
const LOADINGS_SHOWN = 6;
const LINKS_SHOWN = 6;
const SCORES_KEPT = 6;
const ENDS_SHOWN = 4;

/** Descriptors of one family are the color ones; everything else counts as structure. */
function isColor(name: string): boolean {
    return COLOR.has(name);
}

/**
 * PCA of the feature table, plus the second half a report needs: which measures load on each
 * component, which grammar parameters track it, and which grammars sit at its ends.
 */
export function buildPcaReport(
    features: Features,
    grammars: readonly GrammarInput[],
    options: PcaOptions,
): PcaReport {
    if (features.rows.length === 0) {
        throw new Error('PCA: empty feature table — each grammar needs 4 valid images');
    }

    // Columns: descriptor means (and spreads with std), filtered by the family, constants dropped.
    const candidates = features.names.flatMap((name, j) => {
        const kept = options.only === undefined || (options.only === 'color') === isColor(name);
        const columns = [{ label: name, pick: (row: FeatureRow) => row.mean[j] }];

        if (options.std) {
            columns.push({ label: `${name}.std`, pick: (row) => row.std[j] });
        }

        return kept ? columns : [];
    });
    const kept = candidates.filter(({ pick }) => new Set(features.rows.map(pick)).size > 1);

    if (kept.length === 0) {
        throw new Error('PCA: no varying column in the feature table');
    }

    const result = pca(features.rows.map((row) => kept.map(({ pick }) => pick(row))));

    const inputs = features.rows.map((row) => {
        const input = grammars[row.grammar];

        if (!input) {
            throw new Error(`PCA: no grammar data for dataset grammar ${row.grammar}`);
        }

        return input;
    });
    const operators = [...new Set(inputs.flatMap((g) => Object.keys(g.weights)))].sort();
    const parameters = [
        ...operators.map((name) => ({
            label: `w:${name}`,
            pick: (g: GrammarInput) => g.weights[name] ?? 0,
        })),
        // Constraints are derived from the size profile, never stored in a grammar: correlating
        // them still says which budget tracks a component, without trusting a second copy.
        ...(['minDepth', 'maxDepth', 'maxNodes'] as const).map((key) => ({
            label: key,
            pick: (g: GrammarInput) => constraintsOf(g.size)[key],
        })),
        {
            label: 'shareDepth',
            pick: (g: GrammarInput) => g.shareDepth,
        },
        {
            label: 'vocabulary',
            pick: (g: GrammarInput) => Object.values(g.weights).filter((w) => w > 0).length,
        },
    ];

    const components = Array.from({ length: Math.min(COMPONENTS_SHOWN, kept.length) }, (_, k) => {
        const loadings = kept
            .map(({ label }, j) => ({ label, value: result.components[k][j] }))
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
            .slice(0, LOADINGS_SHOWN);
        const scores = result.scores.map((row) => row[k]);
        const links = parameters
            .map(({ label, pick }) => ({ label, r: correlation(scores, inputs.map(pick)) }))
            .filter(({ r }) => r !== 0)
            .sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
            .slice(0, LINKS_SHOWN);
        const order = scores.map((_, i) => i).sort((a, b) => scores[a] - scores[b]);
        const at = (positions: readonly number[]): readonly number[] =>
            positions.map((i) => features.rows[i].grammar);

        return {
            loadings,
            links,
            lowEnd: at(order.slice(0, ENDS_SHOWN)),
            highEnd: at(order.slice(-ENDS_SHOWN).reverse()),
        };
    });

    return {
        columns: kept.map(({ label }) => label),
        explained: result.explained,
        components,
        grammars: features.rows.map((row, i) => ({
            grammar: row.grammar,
            scores: result.scores[i].slice(0, SCORES_KEPT),
        })),
    };
}

/** The report as text: what the PCA step prints on stdout. */
export function formatPcaReport(report: PcaReport): string {
    const signed = (x: number): string => (x >= 0 ? '+' : '') + x.toFixed(2);
    const lines = [`${report.grammars.length} grammars × ${report.columns.length} columns`];
    let cumulative = 0;

    report.components.forEach(({ loadings, links, lowEnd, highEnd }, k) => {
        cumulative += report.explained[k];

        lines.push(
            '',
            `PC${k + 1}  ${(report.explained[k] * 100).toFixed(1)}%  (cumulative ${(cumulative * 100).toFixed(1)}%)`,
            `  measures : ${loadings.map((l) => `${l.label} ${signed(l.value)}`).join('  ')}`,
            `  weights  : ${links.map((l) => `${l.label} ${signed(l.r)}`).join('  ')}`,
            `  low end  : grammars ${lowEnd.join(', ')}`,
            `  high end : grammars ${highEnd.join(', ')}`,
        );
    });

    return lines.join('\n');
}
