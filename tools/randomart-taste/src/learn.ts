import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Résout un chemin relatif par rapport au fichier source (et non au CWD). */
function toAbsolute(input: string): string {
    return input.startsWith('.') ? resolve(__dirname, input) : input;
}

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

/** Garde-fou de type pour valider la structure du dataset JSON. */
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

/** Charge le dataset JSON avec un garde-fou de type. */
function loadDataset(input: string): SampleRow[] {
    const raw: unknown = JSON.parse(readFileSync(input, 'utf8'));
    if (!isRawDataset(raw)) {
        throw new Error(`Dataset invalide: ${input}`);
    }
    return raw.rows;
}

/** Moyenne d'un tableau. */
function mean(xs: readonly number[]): number {
    let s = 0;
    for (const x of xs) {
        s += x;
    }
    return s / xs.length;
}

/**
 * Régression ridge avec intercepte non régularisée.
 *
 * X est centré-réduit (colonne par colonne) et y est centré avant résolution des équations normales
 * : cela conditionne bien mieux le système et l'intercepte est reconstruit analytiquement
 * (intercept = mean(y) − X̄·coef). Les coefficients sont retournés à l'échelle brute des données
 * d'origine.
 *
 * Avec un intercept libre, R² sur l'apprentissage est garanti ≥ 0 : le point coef = 0 (prédiction =
 * mean(y)) atteint SSE = SST, donc l'optimum ridge fait au moins aussi bien.
 */
function ridgeRegression(
    X: readonly number[][], // n × p
    y: readonly number[], // n
    lambda: number,
): { coef: number[]; intercept: number } {
    const p = X.at(0)?.length ?? 0;
    const n = X.length;

    // Moyennes colonnes de X et moyenne de y
    const meanX: number[] = Array.from({ length: p }, () => 0);
    let rowIdx = 0;
    for (const row of X) {
        if (!row) {
            rowIdx++;
            continue;
        }
        let colIdx = 0;
        while (colIdx < p) {
            meanX[colIdx] = (meanX[colIdx] ?? 0) + (row.at(colIdx) ?? 0);
            colIdx++;
        }
        rowIdx++;
    }
    let k = 0;
    while (k < p) {
        meanX[k] = (meanX[k] ?? 0) / n;
        k++;
    }

    // Écarts-types colonnes de X (1 si nulle pour éviter la division par zéro)
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

    // X centré-réduit, y centré
    const Xc: number[][] = Array.from({ length: n }, () => Array(p).fill(0));
    const yc: number[] = Array(n).fill(0);
    rowIdx = 0;
    for (const row of X) {
        const rowXc = Xc.at(rowIdx);
        if (!row || !rowXc) {
            rowIdx++;
            continue;
        }
        yc[rowIdx] = (y.at(rowIdx) ?? 0) - meanY;
        k = 0;
        while (k < p) {
            rowXc[k] = ((row.at(k) ?? 0) - (meanX[k] ?? 0)) / (stdX[k] ?? 1);
            k++;
        }
        rowIdx++;
    }

    // Coordinate descent sur le système centré : minimise ||yc − Xc·θ||² + λ||θ||².
    // Robuste au conditionnement (contrairement aux équations normales résolues
    // par Gauss-Jordan, instables ici à cause de la collinéarité des features).
    // Comme Xc est standardisé, ||Xc_j||² = n pour chaque colonne j.
    const theta: number[] = Array.from({ length: p }, () => 0);
    const fit: number[] = Array.from({ length: n }, () => 0); // Xc · theta, incrémental
    // Transposée de Xc pour accéder aux colonnes sans réallocation dans la boucle chaude
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

    // Filet de sécurité : si la descente n'a pas assez convergé pour battre le
    // modèle constant (SSE > SST), on retourne θ = 0 ⇒ R² = 0 (jamais négatif).
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

    // Retour à l'échelle brute : coef_raw[j] = theta[j] / stdX[j]
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

/** Coefficient de détermination R². */
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

/** Point d'entrée principal. */
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

    // Construire la matrice X (n × p) et les vecteurs y (utilise des Map pour éviter
    // l'indexation non vérifiée de Record avec noUncheckedIndexedAccess)
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

        // Prédictions et R² sur données brutes
        const yPred: number[] = [];
        let i2 = 0;
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
            i2++;
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

    // Sauvegarde optionnelle
    if (options.output) {
        writeFileSync(
            toAbsolute(options.output),
            JSON.stringify({ lambda, topN, results }, null, 2),
        );
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
