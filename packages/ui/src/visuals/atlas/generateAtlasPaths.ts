const SIZE = 300;

interface Dot {
    cx: string;
    cy: string;
    r: string;
}

export interface Paths {
    openPaths: string[];
    closedPaths: string[];
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

function buildDots(rand: () => number): Dot[] {
    return Array.from({ length: 12 }, () => ({
        cx: (rand() * SIZE).toFixed(1),
        cy: (rand() * SIZE).toFixed(1),
        r: (0.8 + rand() * 0.8).toFixed(1),
    }));
}

function buildOpenPaths(rand: () => number): string[] {
    const numCurves = 4 + Math.floor(rand() * 4);
    const paths: string[] = [];

    for (let c = 0; c < numCurves; c++) {
        let x = 20 + rand() * (SIZE - 40);
        let y = 20 + rand() * (SIZE - 40);
        const segments = 8 + Math.floor(rand() * 10);
        let d = `M${x.toFixed(1)},${y.toFixed(1)}`;

        for (let i = 0; i < segments; i++) {
            const x2 = Math.max(10, Math.min(SIZE - 10, x + (rand() - 0.5) * 90));
            const y2 = Math.max(10, Math.min(SIZE - 10, y + (rand() - 0.5) * 90));
            const cx = (x + x2) / 2 + (rand() - 0.5) * 40;
            const cy = (y + y2) / 2 + (rand() - 0.5) * 40;

            d += ` Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
            x = x2;
            y = y2;
        }
        paths.push(d);
    }
    return paths;
}

function buildClosedPaths(rand: () => number): string[] {
    const numShapes = 1 + Math.floor(rand() * 2);
    const paths: string[] = [];

    for (let s = 0; s < numShapes; s++) {
        const cx = 60 + rand() * (SIZE - 120);
        const cy = 60 + rand() * (SIZE - 120);
        const r = 30 + rand() * 60;
        const points = 6 + Math.floor(rand() * 6);
        let d = '';

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const rr = r * (0.7 + rand() * 0.6);
            const px = cx + Math.cos(angle) * rr;
            const py = cy + Math.sin(angle) * rr;
            d += `${i === 0 ? 'M' : ' L'}${px.toFixed(1)},${py.toFixed(1)}`;
        }
        paths.push(`${d} Z`);
    }
    return paths;
}

export function generateAtlasPaths(seed: number): Paths {
    const rand = mulberry32(seed);
    return {
        openPaths: buildOpenPaths(rand),
        closedPaths: buildClosedPaths(rand),
        dots: buildDots(rand),
    };
}
