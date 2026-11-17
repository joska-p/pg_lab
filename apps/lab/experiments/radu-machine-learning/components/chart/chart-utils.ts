import type { ChartBounds, ChartPoint, Domain } from './types';

export function computeChartBounds(
    data: ChartPoint[],
    options: { padRatio?: number; clampToZero?: boolean } = {},
): ChartBounds {
    if (data.length === 0) {
        return { xDomain: [0, 1], yDomain: [0, 1] };
    }

    const { padRatio = 0.05, clampToZero = true } = options;

    const createDomain = (values: number[]): Domain => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        let domainMin = min - range * padRatio;
        const domainMax = max + range * padRatio;

        // Prevent positive/zero baselines from generating negative domains/ticks
        if (clampToZero && min >= 0 && domainMin < 0) {
            domainMin = 0;
        }

        return [domainMin, domainMax];
    };

    return {
        xDomain: createDomain(data.map((d) => d.x)),
        yDomain: createDomain(data.map((d) => d.y)),
    };
}

export function getTicks(domain: Domain, count = 5): number[] {
    const [min, max] = domain;

    if (count <= 1) {
        return [min];
    }

    const step = (max - min) / (count - 1);

    return Array.from({ length: count }, (_, i) => min + i * step);
}

export function createScalers(
    xDomain: Domain,
    yDomain: Domain,
    dimensions: {
        width: number;
        height: number;
        margin: { top: number; right: number; bottom: number; left: number };
    },
) {
    const { width, height, margin } = dimensions;

    const xScale = (v: number) => {
        const range = xDomain[1] - xDomain[0];

        if (range === 0) {
            return margin.left;
        }

        return margin.left + ((v - xDomain[0]) / range) * (width - margin.left - margin.right);
    };

    const yScale = (v: number) => {
        const range = yDomain[1] - yDomain[0];

        if (range === 0) {
            return height - margin.bottom;
        }

        return (
            height -
            margin.bottom -
            ((v - yDomain[0]) / range) * (height - margin.top - margin.bottom)
        );
    };

    return { xScale, yScale };
}
