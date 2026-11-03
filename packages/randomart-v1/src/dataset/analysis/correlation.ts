/**
 * Pearson correlation of two equal-length vectors, in [-1, 1]. Shared by the image descriptors
 * (`channelCorrelation`) and the PCA report. A constant input carries no correlation information:
 * it reads as 0, not NaN.
 */
export function correlation(a: ArrayLike<number>, b: ArrayLike<number>): number {
    const n = a.length;
    let ma = 0;
    let mb = 0;

    for (let i = 0; i < n; i++) {
        ma += a[i];
        mb += b[i];
    }

    ma /= n;
    mb /= n;

    let cov = 0;
    let va = 0;
    let vb = 0;

    for (let i = 0; i < n; i++) {
        cov += (a[i] - ma) * (b[i] - mb);
        va += (a[i] - ma) ** 2;
        vb += (b[i] - mb) ** 2;
    }

    return va === 0 || vb === 0 ? 0 : cov / Math.sqrt(va * vb);
}
