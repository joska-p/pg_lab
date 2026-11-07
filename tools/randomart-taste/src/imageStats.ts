/**
 * Measured visual features of a rendered frame. Pure functions over RGBA bytes: no DOM, no GPU, so
 * they are unit-tested in Node and reused as-is on frames coming back from the browser.
 */

/** Sobel magnitude (on luminance in [0, 1]) above which a pixel counts as an edge. */
const EDGE_THRESHOLD = 0.5;

export interface Frame {
    readonly width: number;
    readonly height: number;
    /** Row-major RGBA bytes, 4 per pixel. */
    readonly rgba: ArrayLike<number>;
}

export interface FrameStats {
    /** Mean luminance, [0, 1]. */
    readonly brightness: number;
    /** Standard deviation of luminance. */
    readonly contrast: number;
    /** Share of interior pixels whose Sobel gradient exceeds the edge threshold: hard edges. */
    readonly sharpness: number;
    /** Mean |luminance - 3x3 box blur|: fine detail and grain, zero on smooth gradients. */
    readonly busyness: number;
    /** Mean chroma (max - min of r, g, b), [0, 1]. */
    readonly colorfulness: number;
}

export interface ImageStats extends FrameStats {
    /** Mean absolute luminance change between consecutive phases (cyclic); 0 for one frame. */
    readonly motion: number;
}

interface Analysis {
    readonly stats: FrameStats;
    readonly luma: Float32Array;
}

function assertFrame(frame: Frame): void {
    const { width, height, rgba } = frame;

    if (width < 1 || height < 1 || rgba.length !== width * height * 4) {
        throw new Error(
            `Frame ${width}x${height} needs ${width * height * 4} bytes, got ${rgba.length}`,
        );
    }
}

function lumaOf(frame: Frame): Float32Array {
    const { width, height, rgba } = frame;
    const luma = new Float32Array(width * height);

    for (let index = 0; index < luma.length; index++) {
        const offset = index * 4;
        const red = rgba[offset] ?? 0;
        const green = rgba[offset + 1] ?? 0;
        const blue = rgba[offset + 2] ?? 0;

        luma[index] = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    }

    return luma;
}

function chromaOf(frame: Frame): number {
    const { width, height, rgba } = frame;
    const pixels = width * height;
    let total = 0;

    for (let index = 0; index < pixels; index++) {
        const offset = index * 4;
        const red = rgba[offset] ?? 0;
        const green = rgba[offset + 1] ?? 0;
        const blue = rgba[offset + 2] ?? 0;

        total += Math.max(red, green, blue) - Math.min(red, green, blue);
    }

    return total / pixels / 255;
}

function meanOf(values: ArrayLike<number>): number {
    let total = 0;

    for (let index = 0; index < values.length; index++) {
        total += values[index] ?? 0;
    }

    return values.length === 0 ? 0 : total / values.length;
}

function deviationOf(values: ArrayLike<number>, mean: number): number {
    let total = 0;

    for (let index = 0; index < values.length; index++) {
        total += ((values[index] ?? 0) - mean) ** 2;
    }

    return values.length === 0 ? 0 : Math.sqrt(total / values.length);
}

/** Edge share and detail energy over the interior (the 1px border has no full 3x3 window). */
function spatialStats(
    luma: Float32Array,
    width: number,
    height: number,
): { sharpness: number; busyness: number } {
    if (width < 3 || height < 3) {
        return { sharpness: 0, busyness: 0 };
    }

    let edges = 0;
    let detail = 0;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = y * width + x;
            const nw = luma[i - width - 1] ?? 0;
            const n = luma[i - width] ?? 0;
            const ne = luma[i - width + 1] ?? 0;
            const w = luma[i - 1] ?? 0;
            const c = luma[i] ?? 0;
            const e = luma[i + 1] ?? 0;
            const sw = luma[i + width - 1] ?? 0;
            const s = luma[i + width] ?? 0;
            const se = luma[i + width + 1] ?? 0;
            const gx = ne + 2 * e + se - nw - 2 * w - sw;
            const gy = sw + 2 * s + se - nw - 2 * n - ne;

            if (Math.hypot(gx, gy) > EDGE_THRESHOLD) {
                edges++;
            }

            detail += Math.abs(c - (nw + n + ne + w + c + e + sw + s + se) / 9);
        }
    }

    const interior = (width - 2) * (height - 2);

    return { sharpness: edges / interior, busyness: detail / interior };
}

function analyze(frame: Frame): Analysis {
    assertFrame(frame);

    const luma = lumaOf(frame);
    const brightness = meanOf(luma);
    const { sharpness, busyness } = spatialStats(luma, frame.width, frame.height);

    return {
        luma,
        stats: {
            brightness,
            contrast: deviationOf(luma, brightness),
            sharpness,
            busyness,
            colorfulness: chromaOf(frame),
        },
    };
}

/** Statistics of one still frame. */
export function frameStats(frame: Frame): FrameStats {
    return analyze(frame).stats;
}

function motionOf(lumas: readonly Float32Array[]): number {
    if (lumas.length < 2) {
        return 0;
    }

    let total = 0;

    for (const [index, current] of lumas.entries()) {
        const next = lumas[(index + 1) % lumas.length];

        if (next === undefined || next.length !== current.length) {
            throw new Error('Frames of one image must have the same size');
        }

        let difference = 0;

        for (let pixel = 0; pixel < current.length; pixel++) {
            difference += Math.abs((current[pixel] ?? 0) - (next[pixel] ?? 0));
        }

        total += difference / current.length;
    }

    return total / lumas.length;
}

/** Statistics of an image rendered at several phases: per-frame stats averaged, plus motion. */
export function imageStats(frames: readonly Frame[]): ImageStats {
    if (frames.length === 0) {
        throw new Error('imageStats needs at least one frame');
    }

    const analyses = frames.map(analyze);
    const average = (pick: (stats: FrameStats) => number): number =>
        meanOf(analyses.map((analysis) => pick(analysis.stats)));

    return {
        brightness: average((stats) => stats.brightness),
        contrast: average((stats) => stats.contrast),
        sharpness: average((stats) => stats.sharpness),
        busyness: average((stats) => stats.busyness),
        colorfulness: average((stats) => stats.colorfulness),
        motion: motionOf(analyses.map((analysis) => analysis.luma)),
    };
}
