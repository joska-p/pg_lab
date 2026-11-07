import { readFileSync, writeFileSync } from 'node:fs';

export interface LearnOptions {
    input: string;
    output?: string;
    lambda?: number; // régularisation ridge
    topN?: number; // combien de coefficients afficher par feature visuelle
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

/** Données brutes du fichier samples.json. */
interface RawDataset {
    readonly meta: unknown;
    readonly rows: SampleRow[];
}

/** Résultat de régression pour une feature visuelle. */
export interface FeatureResult {
    readonly target: string;
    readonly intercept: number;
    /** Coef[featureName] = coefficient de régression (standardisé) */
    readonly coef: Record<string, number>;
    readonly r2: number;
}

/** Charge le dataset JSON. */
function loadDataset(input: string): SampleRow[] {
    const raw = JSON.parse(readFileSync(input, 'utf8')) as RawDataset;
    return raw.rows;
}

/** Moyenne d'un tableau. */
function mean(xs: readonly number[]): number {
    let s = 0;
    for (const x of xs) {s += x;}
    return s / xs.length;
}

/** Écart-type (population). */
function std(xs: readonly number[], m: number): number {
    let s = 0;
    for (const x of xs) {s += (x - m) ** 2;}
    return Math.sqrt(s / xs.length);
}

/** Produit matrice-matrice A (m×n) * B (n×p). */
function matMul(A: number[][], B: number[][]): number[][] {
    const m = A.length;
    const n = B[0].length;
    const inner = B.length;
    const C: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
    for (let i = 0; i < m; i++) {
        for (let k = 0; k < inner; k++) {
            const aik = A[i][k];
            if (aik === 0) {continue;}
            for (let j = 0; j < n; j++) {
                C[i][j] += aik * B[k][j];
            }
        }
    }
    return C;
}

/** Transposée. */
function transpose(A: number[][]): number[][] {
    const m = A.length;
    const n = A[0].length;
    const T: number[][] = Array.from({ length: n }, () => Array(m).fill(0));
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            T[j][i] = A[i][j];
        }
    }
    return T;
}

/** Résout A x = b par Gauss-Jordan avec pivot partiel. Retourne x. */
function solve(A: number[][], b: number[]): number[] {
    const n = A.length;
    const M: number[][] = [];
    for (let i = 0; i < n; i++) {
        M.push([...A[i], b[i]]);
    }

    for (let col = 0; col < n; col++) {
        // Pivot partiel
        let maxRow = col;
        for (let r = col + 1; r < n; r++) {
            if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) {
                maxRow = r;
            }
        }
        if (maxRow !== col) {
            [M[col], M[maxRow]] = [M[maxRow], M[col]];
        }
        const piv = M[col][col];
        if (Math.abs(piv) < 1e-12) {
            continue; // colonne dégénérée, on saute
        }
        for (let r = 0; r < n; r++) {
            if (r === col) {continue;}
            const factor = M[r][col] / piv;
            for (let k = col; k <= n; k++) {
                M[r][k] -= factor * M[col][k];
            }
        }
    }

    const x = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        const piv = M[i][i];
        x[i] = Math.abs(piv) < 1e-12 ? 0 : M[i][n] / piv;
    }
    return x;
}

/**
 * Régression ridge avec intercepte. Retourne les coefficients bruts (sur données non centrées) et
 * l'intercepte.
 */
function ridgeRegression(
    X: number[][], // n × p
    y: number[], // n
    lambda: number,
): { coef: number[]; intercept: number } {
    const n = X.length;
    const p = X[0].length;

    // Matrice augmentée avec colonne d'intercepte (dernière colonne = 1)
    const Xa: number[][] = X.map((row) => [...row, 1]);
    const pa = p + 1;

    // A = Xa^T Xa + lambda * I (pas de régularisation sur l'intercepte)
    const Xt = transpose(Xa);
    const A = matMul(Xt, Xa);
    for (let i = 0; i < pa; i++) {
        A[i][i] += i === p ? 0 : lambda;
    }

    // b = Xa^T y
    const yCol: number[][] = y.map((v) => [v]);
    const XtY = matMul(Xt, yCol);
    const b = XtY.map((row) => row[0]);

    const theta = solve(A, b);
    const coef = theta.slice(0, p);
    const intercept = theta[p];
    return { coef, intercept };
}

/** Coefficient de détermination R². */
function r2Score(y: number[], yPred: number[]): number {
    const m = mean(y);
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < y.length; i++) {
        ssRes += (y[i] - yPred[i]) ** 2;
        ssTot += (y[i] - m) ** 2;
    }
    return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

/** Point d'entrée principal. */
export function learn(options: LearnOptions): FeatureResult[] {
    const lambda = options.lambda ?? 0.01;
    const topN = options.topN ?? 10;
    const rows = loadDataset(options.input);

    const featureNames = Object.keys(rows[0]?.features ?? {});
    const targets = [
        'brightness',
        'contrast',
        'sharpness',
        'busyness',
        'colorfulness',
        'motion',
    ] as const;

    // Construire la matrice X (n × p) et les vecteurs y
    const n = rows.length;
    const p = featureNames.length;
    const X: number[][] = Array.from({ length: n }, () => Array(p).fill(0));

    const yByTarget: Record<string, number[]> = {};
    for (const t of targets) {yByTarget[t] = Array(n).fill(0);}

    for (let i = 0; i < n; i++) {
        const row = rows[i]!;
        for (let j = 0; j < p; j++) {
            X[i][j] = row.features[featureNames[j]] ?? 0;
        }
        for (const t of targets) {
            yByTarget[t][i] = row.stats[t];
        }
    }

    const results: FeatureResult[] = [];

    for (const target of targets) {
        const y = yByTarget[target];
        const { coef, intercept } = ridgeRegression(X, y, lambda);

        // Prédictions et R² sur données brutes
        const yPred = X.map((row) => row.reduce((s, x, j) => s + x * coef[j], intercept));
        const score = r2Score(y, yPred);

        const coefRecord: Record<string, number> = {};
        for (let j = 0; j < p; j++) {
            coefRecord[featureNames[j]] = coef[j];
        }

        results.push({ target, intercept, coef: coefRecord, r2: score });
    }

    // Sauvegarde optionnelle
    if (options.output) {
        writeFileSync(options.output, JSON.stringify({ lambda, topN, results }, null, 2));
    }

    return results;
}

/** Affichage lisible dans la console. */
export function printResults(results: FeatureResult[], topN: number): void {
    for (const res of results) {
        console.log(
            `\n═══ ${res.target} (R² = ${res.r2.toFixed(3)}, intercept = ${res.intercept.toFixed(4)}) ═══`,
        );

        const entries = Object.entries(res.coef)
            .map(([name, coef]) => ({ name, coef, abs: Math.abs(coef) }))
            .sort((a, b) => b.abs - a.abs)
            .slice(0, topN);

        console.log('  + les plus positifs :');
        for (const { name, coef } of entries.filter((e) => e.coef > 0)) {
            console.log(`      ${name.padEnd(24)} ${coef.toFixed(4)}`);
        }

        console.log('  - les plus négatifs :');
        for (const { name, coef } of entries.filter((e) => e.coef < 0).reverse()) {
            console.log(`      ${name.padEnd(24)} ${coef.toFixed(4)}`);
        }
    }
}
