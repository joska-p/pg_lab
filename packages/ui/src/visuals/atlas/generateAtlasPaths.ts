interface Dot {
    cx: string;
    cy: string;
    r: string;
}

export interface Paths {
    openPaths: string;
    openPathsLength: number;
    closedPaths: string;
    closedPathsLength: number;
    dots: Dot[];
}

export function mulberry32(seed: number) {
    return function random() {
        let t = (seed += 0x6d2b79f5);

        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const SIZE = 300;

function buildOpenPaths(rand: () => number): { d: string; length: number } {
    const numCurves = 4 + Math.floor(rand() * 4);
    let d = '';
    let length = 0;

    for (let c = 0; c < numCurves; c++) {
        let x = 20 + rand() * (SIZE - 40);
        let y = 20 + rand() * (SIZE - 40);
        const segments = 8 + Math.floor(rand() * 10);

        d += `M${x.toFixed(1)},${y.toFixed(1)}`;

        for (let i = 0; i < segments; i++) {
            const x2 = Math.max(10, Math.min(SIZE - 10, x + (rand() - 0.5) * 90));
            const y2 = Math.max(10, Math.min(SIZE - 10, y + (rand() - 0.5) * 90));
            const cx = (x + x2) / 2 + (rand() - 0.5) * 40;
            const cy = (y + y2) / 2 + (rand() - 0.5) * 40;

            // Approximate quadratic bezier curve length using control points
            const dx1 = cx - x;
            const dy1 = cy - y;
            const dx2 = x2 - cx;
            const dy2 = y2 - cy;
            // Use the average of chord length and control point distances as approximation
            const chordLength = Math.sqrt(dx1 * dx1 + dy1 * dy1) + Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const directLength = Math.sqrt((x2 - x) ** 2 + (y2 - y) ** 2);
            length += (chordLength + directLength) / 2;

            d += ` Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
            x = x2;
            y = y2;
        }
    }

    return { d, length };
}

function buildClosedPaths(rand: () => number): { d: string; length: number } {
    const numShapes = 1 + Math.floor(rand() * 2);
    let d = '';
    let length = 0;

    for (let s = 0; s < numShapes; s++) {
        const cx = 60 + rand() * (SIZE - 120);
        const cy = 60 + rand() * (SIZE - 120);
        const r = 30 + rand() * 60;
        const points = 6 + Math.floor(rand() * 6);

        let prevX = 0;
        let prevY = 0;
        let firstX = 0;
        let firstY = 0;

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const rr = r * (0.7 + rand() * 0.6);
            const px = cx + Math.cos(angle) * rr;
            const py = cy + Math.sin(angle) * rr;

            if (i === 0) {
                d += `M${px.toFixed(1)},${py.toFixed(1)}`;
                prevX = px;
                prevY = py;
                firstX = px;
                firstY = py;
            } else {
                // Add distance between previous and current point
                length += Math.sqrt((px - prevX) ** 2 + (py - prevY) ** 2);
                d += ` L${px.toFixed(1)},${py.toFixed(1)}`;
                prevX = px;
                prevY = py;
            }
        }

        // Close the path: add distance from last point back to first
        length += Math.sqrt((prevX - firstX) ** 2 + (prevY - firstY) ** 2);
        d += ' Z';
    }

    return { d, length };
}

function buildDots(rand: () => number): Dot[] {
    return Array.from({ length: 12 }, () => ({
        cx: (rand() * SIZE).toFixed(1),
        cy: (rand() * SIZE).toFixed(1),
        r: (0.8 + rand() * 0.8).toFixed(1),
    }));
}

export function generateAtlasPaths(seed: number): Paths {
    const rand = mulberry32(seed);

    const { d: openPaths, length: openPathsLength } = buildOpenPaths(rand);
    const { d: closedPaths, length: closedPathsLength } = buildClosedPaths(rand);

    return {
        openPaths,
        openPathsLength,
        closedPaths,
        closedPathsLength,
        dots: buildDots(rand),
    };
}
