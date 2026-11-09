import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Resolve a relative path against the source file (not the current working directory). */
function toAbsolute(input: string): string {
    return input.startsWith('.') ? resolve(__dirname, input) : input;
}

export interface LearnOptions {
    input: string;
    output?: string;
    lambda?: number; // ridge regularization strength
    topN?: number; // how many coefficients to print per visual feature
}

interface SampleRow {
    readonly features: Record<string, number>;
    readonly stats: {
        readonly brightness: number;
        readonly contrast: number;
        readonly sharpness: number;
        readonly busyness: number;
        readonly colorfulness: number;
        readonly motion: number;
    };
}

/** Raw data read from samples.json. */
interface RawDataset {
    readonly meta: unknown;
    readonly rows: SampleRow[];
}

/** Regression result for one visual feature. */
export interface FeatureResult {
    readonly target: string;
    readonly intercept: number;
    /** Coef[featureName] = regression coefficient in the raw feature scale (not standardized). */
    readonly coef: Record<string, number>;
    readonly r2: number;
}

/** Type guard validating the dataset JSON structure. */
function isRawDataset(value: unknown): value is RawDataset {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const entries = Object.entries(value);
    const rowsEntry = entries.find(([key]) => key === 'rows');
    if (!rowsEntry) {
        return false;
    }
    return Array.isArray(rowsEntry[1]);
}

/** Load the dataset JSON behind a type guard. */
function loadDataset(input: string): SampleRow[] {
    const raw: unknown = JSON.parse(readFileSync(input, 'utf8'));
    if (!isRawDataset(raw)) {
        throw new Error(`Invalid dataset: ${input}`);
    }
    return raw.rows;
}

/** Arithmetic mean of an array. */
function mean(xs: readonly number[]): number {
    let s = 0;
    for (const x of xs) {
        s += x;
    }
    return s / xs.length;
}

/**
 * Ridge regression with an unregularized intercept.
 *
 * X is standardized (column by column) and y is centered before solving the normal equations: this
 * conditions the system much better and the intercept is reconstructed analytically (intercept =
 * mean(y) − X̄·coef). Coefficients are returned in the original raw data scale.
 *
 * With a free intercept, training R² is guaranteed to be ≥ 0: the point coef = 0 (prediction =
 * mean(y)) reaches SSE = SST, so the ridge optimum does at least as well.
 */
export function ridgeRegression(
    X: readonly number[][], // n × p
    y: readonly number[], // n
    lambda: number,
): { coef: number[]; intercept: number } {
    const p = X.at(0)?.length ?? 0;
    const n = X.length;

    // Column means of X and mean of y
    const meanX: number[] = Array.from({ length: p }, () => 0);
    for (const row of X) {
        let colIdx = 0;
        while (colIdx < p) {
            meanX[colIdx] = (meanX[colIdx] ?? 0) + (row.at(colIdx) ?? 0);
            colIdx++;
        }
    }
    let k = 0;
    while (k < p) {
        meanX[k] = (meanX[k] ?? 0) / n;
        k++;
    }

    // Column standard deviations of X (1 when zero, to avoid division by zero)
    const stdX: number[] = Array.from({ length: p }, () => 1);
    k = 0;
    while (k < p) {
        let s = 0;
        let count = 0;
        for (const row of X) {
            if (!row) {
                continue;
            }
            const d = (row.at(k) ?? 0) - (meanX[k] ?? 0);
            s += d * d;
            count++;
        }
        const v = s / Math.max(count, 1);
        stdX[k] = v > 0 ? Math.sqrt(v) : 1;
        k++;
    }

    const meanY = mean(y);

    // Centered X, centered y
    const Xc: number[][] = Array.from({ length: n }, () => Array(p).fill(0));
    const yc: number[] = Array(n).fill(0);
    for (const [rowIdx, row] of X.entries()) {
        const rowXc = Xc.at(rowIdx);
        if (!row || !rowXc) {
            continue;
        }
        yc[rowIdx] = (y.at(rowIdx) ?? 0) - meanY;
        k = 0;
        while (k < p) {
            rowXc[k] = ((row.at(k) ?? 0) - (meanX[k] ?? 0)) / (stdX[k] ?? 1);
            k++;
        }
    }

    // Coordinate descent on the centered system: minimize ||yc − Xc·θ||² + λ||θ||².
    // Robust to conditioning (unlike normal equations solved with Gauss-Jordan,
    // which are unstable here because features are collinear).
    // Since Xc is standardized, ||Xc_j||² = n for every column j.
    const theta: number[] = Array.from({ length: p }, () => 0);
    const fit: number[] = Array.from({ length: n }, () => 0); // Xc · theta, updated incrementally
    // Transpose of Xc, so hot loops can access columns without reallocating
    const XcT: number[][] = Array.from({ length: p }, () => Array.from({ length: n }, () => 0));
    let i4 = 0;
    while (i4 < n) {
        const rowXc = Xc.at(i4) ?? [];
        let j2 = 0;
        while (j2 < p) {
            (XcT.at(j2) ?? [])[i4] = rowXc.at(j2) ?? 0;
            j2++;
        }
        i4++;
    }
    const lambdaI = n + lambda;
    let iter = 0;
    const maxIter = 500;
    const tol = 1e-9;
    outer: while (iter < maxIter) {
        iter++;
        let maxChange = 0;
        let j = 0;
        while (j < p) {
            const colJ = XcT.at(j) ?? [];
            const thetaJ = theta[j] ?? 0;
            let num = 0;
            let i3 = 0;
            while (i3 < n) {
                const xij = colJ[i3] ?? 0;
                num += xij * ((yc[i3] ?? 0) - (fit[i3] ?? 0) + xij * thetaJ);
                i3++;
            }
            const update = num / lambdaI;
            const change = update - thetaJ;
            maxChange = Math.max(maxChange, Math.abs(change));
            theta[j] = update;
            if (change !== 0) {
                i3 = 0;
                while (i3 < n) {
                    fit[i3] = (fit[i3] ?? 0) + change * (colJ[i3] ?? 0);
                    i3++;
                }
            }
            j++;
        }
        if (maxChange < tol) {
            break outer;
        }
    }

    // Safety net: if the descent did not converge enough to beat the
    // constant model (SSE > SST), return θ = 0 ⇒ R² = 0 (never negative).
    let sse = 0;
    let sst = 0;
    let i3 = 0;
    while (i3 < n) {
        const r = (yc.at(i3) ?? 0) - (fit.at(i3) ?? 0);
        sse += r * r;
        sst += (yc.at(i3) ?? 0) ** 2;
        i3++;
    }
    if (sse > sst) {
        k = 0;
        while (k < p) {
            theta[k] = 0;
            k++;
        }
    }

    // Back to the raw scale: coef_raw[j] = theta[j] / stdX[j]
    const coef: number[] = [];
    k = 0;
    while (k < p) {
        coef.push((theta.at(k) ?? 0) / (stdX[k] ?? 1));
        k++;
    }
    // intercept = mean(y) − Σ coef_raw[j] * meanX[j]
    let intercept = meanY;
    k = 0;
    while (k < p) {
        intercept -= (coef.at(k) ?? 0) * (meanX[k] ?? 0);
        k++;
    }
    return { coef, intercept };
}

/** Coefficient of determination R². */
function r2Score(y: readonly number[], yPred: readonly number[]): number {
    const m = mean(y);
    let ssRes = 0;
    let ssTot = 0;
    let i = 0;
    while (i < y.length) {
        const yi = y.at(i);
        const ypi = yPred.at(i);
        if (yi === undefined || ypi === undefined) {
            i++;
            continue;
        }
        ssRes += (yi - ypi) ** 2;
        ssTot += (yi - m) ** 2;
        i++;
    }
    return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

/** Main entry point. */
export function learn(options: LearnOptions): FeatureResult[] {
    const lambda = options.lambda ?? 0.01;
    const topN = options.topN ?? 10;
    const rows = loadDataset(toAbsolute(options.input));

    const firstRow = rows.at(0);
    if (!firstRow) {
        return [];
    }
    const featureNames = Object.keys(firstRow.features);
    const targets = [
        'brightness',
        'contrast',
        'sharpness',
        'busyness',
        'colorfulness',
        'motion',
    ] as const;

    // Build the X matrix (n × p) and the y vectors (Maps avoid unchecked Record
    // indexing under noUncheckedIndexedAccess)
    const n = rows.length;
    const p = featureNames.length;
    const X: number[][] = Array.from({ length: n }, () => Array(p).fill(0));

    const yByTarget = new Map<string, number[]>();
    for (const t of targets) {
        yByTarget.set(t, Array(n).fill(0));
    }

    let i = 0;
    for (const row of rows) {
        if (!row) {
            continue;
        }

        let j = 0;
        for (const name of featureNames) {
            const rowX = X.at(i);
            if (!rowX) {
                j++;
                continue;
            }
            rowX[j] = row.features[name] ?? 0;
            j++;
        }
        for (const t of targets) {
            const yArr = yByTarget.get(t);
            if (yArr) {
                yArr[i] = row.stats[t];
            }
        }
        i++;
    }

    const results: FeatureResult[] = [];

    for (const target of targets) {
        const y = yByTarget.get(target);
        if (!y) {
            continue;
        }
        const { coef, intercept } = ridgeRegression(X, y, lambda);

        // Predictions and R² on the raw data
        const yPred: number[] = [];
        for (const rowX of X) {
            let s = intercept;
            let j2 = 0;
            while (j2 < p) {
                const x = rowX.at(j2);
                if (x === undefined) {
                    j2++;
                    continue;
                }
                const c = coef.at(j2);
                if (c === undefined) {
                    j2++;
                    continue;
                }
                s += x * c;
                j2++;
            }
            yPred.push(s);
        }
        const score = r2Score(y, yPred);

        const coefRecord: Record<string, number> = {};
        let j3 = 0;
        while (j3 < p) {
            const name = featureNames.at(j3);
            if (name === undefined) {
                j3++;
                continue;
            }
            coefRecord[name] = coef.at(j3) ?? 0;
            j3++;
        }

        results.push({ target, intercept, coef: coefRecord, r2: score });
    }

    // Optional save
    if (options.output) {
        writeFileSync(
            toAbsolute(options.output),
            JSON.stringify({ lambda, topN, results }, null, 2),
        );
    }

    return results;
}

/** Human-readable console output. */
export function printResults(results: FeatureResult[], topN: number): void {
    for (const res of results) {
        console.log(
            `\n═══ ${res.target} (R² = ${res.r2.toFixed(3)}, intercept = ${res.intercept.toFixed(4)}) ═══`,
        );

        const entries = Object.entries(res.coef)
            .map(([name, coef]) => ({ name, coef, abs: Math.abs(coef) }))
            .sort((a, b) => b.abs - a.abs)
            .slice(0, topN);

        console.log('  + most positive:');
        for (const { name, coef } of entries.filter((e) => e.coef > 0)) {
            console.log(`      ${name.padEnd(24)} ${coef.toFixed(4)}`);
        }

        console.log('  - most negative:');
        for (const { name, coef } of entries.filter((e) => e.coef < 0).reverse()) {
            console.log(`      ${name.padEnd(24)} ${coef.toFixed(4)}`);
        }
    }
}
