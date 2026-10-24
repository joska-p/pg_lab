const RGB_MAX = 255;

/** Map an sRGB component (0‥1) to a byte (0‥255). */
function scaleTo255(value: number | null | undefined): number {
    return Math.round(Math.max(0, value ?? 0) * RGB_MAX);
}

export { scaleTo255 };
