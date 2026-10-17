export interface Pca {
    /** Eigenvalues of the correlation matrix, descending. */
    readonly eigenvalues: readonly number[];
    /** Share of the total variance per component. */
    readonly explained: readonly number[];
    /** `components[k][j]`: loading of column j on component k. */
    readonly components: readonly (readonly number[])[];
    /** `scores[i][k]`: position of row i on component k. */
    readonly scores: readonly (readonly number[])[];
}

export function correlation(a: readonly number[], b: readonly number[]): number {
    const n = a.length;
    const ma = a.reduce((s, x) => s + x, 0) / n;
    const mb = b.reduce((s, x) => s + x, 0) / n;
    let cov = 0;
    let va = 0;
    let vb = 0;

    for (let i = 0; i < n; i++) {
        cov += (a[i] - ma) * (b[i] - mb);
        va += (a[i] - ma) ** 2;
        vb += (b[i] - mb) ** 2;
    }

    // A constant column carries no correlation information: 0, not NaN.
    return va === 0 || vb === 0 ? 0 : cov / Math.sqrt(va * vb);
}

/** Cyclic Jacobi for a small symmetric matrix. `vectors[k]` goes with `values[k]`, descending. */
export function jacobiEigen(input: readonly (readonly number[])[]): {
    values: number[];
    vectors: number[][];
} {
    const n = input.length;
    const a = input.map((row) => [...row]);
    const v = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
    );

    for (let sweep = 0; sweep < 100; sweep++) {
        let off = 0;

        for (let p = 0; p < n; p++) {
            for (let q = p + 1; q < n; q++) {
                off += a[p][q] ** 2;
            }
        }

        if (off < 1e-20) {
            break;
        }

        for (let p = 0; p < n - 1; p++) {
            for (let q = p + 1; q < n; q++) {
                if (Math.abs(a[p][q]) < 1e-300) {
                    continue;
                }

                const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
                const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
                const c = 1 / Math.sqrt(t * t + 1);
                const s = t * c;

                for (let k = 0; k < n; k++) {
                    const kp = a[k][p];
                    const kq = a[k][q];

                    a[k][p] = c * kp - s * kq;
                    a[k][q] = s * kp + c * kq;
                }

                for (let k = 0; k < n; k++) {
                    const pk = a[p][k];
                    const qk = a[q][k];

                    a[p][k] = c * pk - s * qk;
                    a[q][k] = s * pk + c * qk;
                }

                for (let k = 0; k < n; k++) {
                    const kp = v[k][p];
                    const kq = v[k][q];

                    v[k][p] = (c * kp - s * kq) as 0 | 1;
                    v[k][q] = (s * kp + c * kq) as 0 | 1;
                }
            }
        }
    }

    const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[j][j] - a[i][i]);

    return {
        values: order.map((i) => a[i][i]),
        vectors: order.map((i) => v.map((row) => row[i])),
    };
}

/**
 * PCA on standardized columns (= eigen-decomposition of the correlation matrix), so a column's unit
 * does not decide its weight. Constant columns are the caller's job to drop. The sign of each
 * component is fixed (largest |loading| positive) so reports are reproducible.
 */
export function pca(matrix: readonly (readonly number[])[]): Pca {
    const rows = matrix.length;
    const cols = matrix[0]?.length ?? 0;
    const mean = Array.from(
        { length: cols },
        (_, j) => matrix.reduce((s, r) => s + r[j], 0) / rows,
    );
    const scale = Array.from({ length: cols }, (_, j) =>
        Math.sqrt(matrix.reduce((s, r) => s + (r[j] - mean[j]) ** 2, 0) / rows),
    );

    if (scale.some((value) => value === 0)) {
        throw new Error('PCA: constant column, drop it first');
    }

    const z = matrix.map((row) => row.map((x, j) => (x - mean[j]) / scale[j]));
    const cov = Array.from({ length: cols }, (_, a) =>
        Array.from({ length: cols }, (_, b) => z.reduce((s, r) => s + r[a] * r[b], 0) / rows),
    );
    const { values, vectors } = jacobiEigen(cov);

    for (const vector of vectors) {
        const pivot = vector.reduce((best, x) => (Math.abs(x) > Math.abs(best) ? x : best), 0);

        if (pivot < 0) {
            vector.forEach((_, j) => {
                vector[j] = -vector[j];
            });
        }
    }

    const total = values.reduce((s, x) => s + x, 0);

    return {
        eigenvalues: values,
        explained: values.map((x) => x / total),
        components: vectors,
        scores: z.map((row) => vectors.map((vec) => vec.reduce((s, x, j) => s + x * row[j], 0))),
    };
}
