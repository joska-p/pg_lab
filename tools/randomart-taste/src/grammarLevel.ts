import { COLOR_SPACE_IDS } from '@repo/randomart-core/colors';
import type { ColorSpaceId } from '@repo/randomart-core/colors';
import type { Grammar } from '@repo/randomart-core/grammar';
import { OP_NAMES } from '@repo/randomart-core/ops';

import type { ImageStats } from './imageStats';
import { ridgeRegression } from './ridge';

/** One rendered sample, as stored in `data/samples.json`. */
export interface GrammarSampleRow {
    readonly grammarId: number;
    readonly grammar: Grammar;
    readonly space: ColorSpaceId;
    readonly stats: ImageStats;
}

export const TARGETS = [
    'brightness',
    'contrast',
    'sharpness',
    'busyness',
    'colorfulness',
    'motion',
] as const satisfies readonly (keyof ImageStats)[];

export type Target = (typeof TARGETS)[number];

/** Families of grammar features, so an ablation can keep or drop each one. */
export type FeatureGroup = 'weights' | 'structure' | 'space';

export const ALL_GROUPS: readonly FeatureGroup[] = ['weights', 'structure', 'space'];

export interface GrammarLevelResult {
    readonly target: Target;
    /** R² on the data the model was fitted on (optimistic). */
    readonly trainR2: number;
    /** R² on held-out grammars, pooled over folds. Can be negative: worse than the mean. */
    readonly cvR2: number;
    /** Raw-scale coefficients of the model fitted on every grammar (selected features only). */
    readonly coef: Readonly<Record<string, number>>;
    /** Change of the target for a one-standard-deviation change of the feature: comparable. */
    readonly effect: Readonly<Record<string, number>>;
    readonly intercept: number;
}

export interface GrammarLevelOptions {
    readonly lambda?: number;
    readonly folds?: number;
    /** Feature groups kept in the model. Defaults to all of them. */
    readonly groups?: readonly FeatureGroup[];
}

interface GrammarPoint {
    readonly grammarId: number;
    readonly x: readonly number[];
    /** Mean stat per grammar, aligned with `TARGETS`. */
    readonly y: readonly number[];
}

interface Column {
    readonly name: string;
    readonly group: FeatureGroup;
}

/** Feature columns, aligned with `featuresOfGrammar`. */
export function grammarColumns(): Column[] {
    return [
        ...OP_NAMES.map((name): Column => ({ name: `weight.${name}`, group: 'weights' })),
        { name: 'minDepth', group: 'structure' },
        { name: 'maxDepth', group: 'structure' },
        { name: 'maxNodes', group: 'structure' },
        { name: 'shareDepth', group: 'structure' },
        ...COLOR_SPACE_IDS.map((id): Column => ({ name: `space.${id}`, group: 'space' })),
    ];
}

export function featuresOfGrammar(grammar: Grammar, space: ColorSpaceId): number[] {
    return [
        ...OP_NAMES.map((name) => grammar.weights[name] ?? 0),
        grammar.minDepth,
        grammar.maxDepth,
        grammar.maxNodes,
        grammar.shareDepth,
        ...COLOR_SPACE_IDS.map((id) => (space === id ? 1 : 0)),
    ];
}

function mean(values: readonly number[]): number {
    return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

function deviation(values: readonly number[]): number {
    const m = mean(values);
    return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

/** Collapse the seeds of each grammar into one point: features and mean stats. */
export function toGrammarPoints(rows: readonly GrammarSampleRow[]): GrammarPoint[] {
    const groups = new Map<number, GrammarSampleRow[]>();

    for (const row of rows) {
        const group = groups.get(row.grammarId) ?? [];
        group.push(row);
        groups.set(row.grammarId, group);
    }

    const points: GrammarPoint[] = [];

    for (const [grammarId, group] of groups) {
        const first = group[0];

        if (first === undefined) {
            continue;
        }

        points.push({
            grammarId,
            x: featuresOfGrammar(first.grammar, first.space),
            y: TARGETS.map((target) => mean(group.map((row) => row.stats[target]))),
        });
    }

    return points;
}

function predict(coef: readonly number[], intercept: number, x: readonly number[]): number {
    let value = intercept;

    for (const [index, weight] of coef.entries()) {
        value += weight * (x[index] ?? 0);
    }

    return value;
}

function select(x: readonly number[], indices: readonly number[]): number[] {
    return indices.map((index) => x[index] ?? 0);
}

/** Fit on grammars, validate on held-out grammars (fold = grammarId % folds). */
export function learnGrammarLevel(
    rows: readonly GrammarSampleRow[],
    { lambda = 0.01, folds = 5, groups = ALL_GROUPS }: GrammarLevelOptions = {},
): GrammarLevelResult[] {
    const points = toGrammarPoints(rows);
    const columns = grammarColumns();
    const indices = columns.flatMap((column, index) =>
        groups.includes(column.group) ? [index] : [],
    );
    const names = indices.map((index) => columns[index]?.name ?? '');
    const xs = points.map((point) => select(point.x, indices));
    const results: GrammarLevelResult[] = [];

    for (const [targetIndex, target] of TARGETS.entries()) {
        const ys = points.map((point) => point.y[targetIndex] ?? 0);
        let cvResidual = 0;
        let cvTotal = 0;

        for (let fold = 0; fold < folds; fold++) {
            const trainIdx: number[] = [];
            const testIdx: number[] = [];

            for (const [index, point] of points.entries()) {
                (point.grammarId % folds === fold ? testIdx : trainIdx).push(index);
            }

            if (trainIdx.length === 0 || testIdx.length === 0) {
                continue;
            }

            const trainY = trainIdx.map((index) => ys[index] ?? 0);
            const { coef, intercept } = ridgeRegression(
                trainIdx.map((index) => xs[index] ?? []),
                trainY,
                lambda,
            );
            const baseline = mean(trainY);

            for (const index of testIdx) {
                const actual = ys[index] ?? 0;
                cvResidual += (actual - predict(coef, intercept, xs[index] ?? [])) ** 2;
                cvTotal += (actual - baseline) ** 2;
            }
        }

        const all = ridgeRegression(xs, ys, lambda);
        const overall = mean(ys);
        let trainResidual = 0;
        let trainTotal = 0;

        for (const [index, x] of xs.entries()) {
            const actual = ys[index] ?? 0;
            trainResidual += (actual - predict(all.coef, all.intercept, x)) ** 2;
            trainTotal += (actual - overall) ** 2;
        }

        const coef: Record<string, number> = {};
        const effect: Record<string, number> = {};

        for (const [column, name] of names.entries()) {
            const value = all.coef[column] ?? 0;
            coef[name] = value;
            effect[name] = value * deviation(xs.map((x) => x[column] ?? 0));
        }

        results.push({
            target,
            trainR2: trainTotal === 0 ? 0 : 1 - trainResidual / trainTotal,
            cvR2: cvTotal === 0 ? 0 : 1 - cvResidual / cvTotal,
            coef,
            effect,
            intercept: all.intercept,
        });
    }

    return results;
}
