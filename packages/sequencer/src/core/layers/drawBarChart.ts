import { readParam } from '../param';
import type { VisualLayer } from '../types';

const barChartParams = {
    barWidth: {
        type: 'number',
        label: 'Bar Width',
        min: 0.1,
        max: 1,
        step: 0.1,
        default: 0.8,
    },
    alpha: {
        type: 'number',
        label: 'Opacity',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.7,
    },
    saturation: {
        type: 'number',
        label: 'Saturation',
        min: 0,
        max: 100,
        step: 5,
        default: 80,
    },
    lightness: {
        type: 'number',
        label: 'Lightness',
        min: 0,
        max: 100,
        step: 5,
        default: 55,
    },
} as const;

export const drawBarChart: VisualLayer = {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Vertical bars from baseline to each sequence value, colored by height',
    category: 'drawing',
    params: barChartParams,
    draw: (ctx, data, params, layout) => {
        const { maxVal, valueScale, offsetX, offsetY } = layout;
        const { saturation, lightness } = params;
        const barWidth = readParam(barChartParams.barWidth, params.barWidth);
        const alpha = readParam(barChartParams.alpha, params.alpha);

        if (data.length === 0 || maxVal === 0) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        const width = valueScale * barWidth;

        data.forEach((val) => {
            const hue = ((Math.abs(val) / maxVal) * 240) % 360;
            const x = offsetX + val * valueScale - width / 2;
            const height = Math.abs(val) * valueScale;
            const dir = val >= 0 ? -1 : 1;

            ctx.fillStyle = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;
            ctx.fillRect(x, offsetY, width, dir * height);
        });

        ctx.restore();
    },
};
