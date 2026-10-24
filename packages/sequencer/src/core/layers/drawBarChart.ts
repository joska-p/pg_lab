import type { VisualLayer } from '../types';

export const drawBarChart: VisualLayer = {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Vertical bars from baseline to each sequence value, colored by height',
    category: 'drawing',
    params: {
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
    },
    draw: (ctx, data, params, layout) => {
        const { maxVal, valueScale, offsetX, offsetY } = layout;
        const { barWidth, alpha, saturation, lightness } = params;

        if (data.length === 0 || maxVal === 0) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = alpha as number;

        const width = valueScale * (barWidth as number);

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
