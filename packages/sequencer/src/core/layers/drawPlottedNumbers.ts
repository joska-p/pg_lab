import { readParam } from '../param';
import type { VisualLayer } from '../types';

const plottedNumbersParams = {
    radius: { label: 'Radius', type: 'number', min: 1, max: 20, step: 1, default: 3 },
    alpha: {
        label: 'Opacity',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.4,
    },
    color: { label: 'Color', type: 'color', default: '' },
} as const;

const drawPlottedNumbers: VisualLayer = {
    id: 'plotted-numbers',
    name: 'Plotted Numbers',
    description: 'Dots at each unique sequence value',
    category: 'cosmetic',
    params: plottedNumbersParams,
    draw: (ctx, data, params, layout) => {
        const { valueScale, offsetX, offsetY } = layout;
        const color = readParam(plottedNumbersParams.color, params.color);
        const alpha = readParam(plottedNumbersParams.alpha, params.alpha);
        const radius = readParam(plottedNumbersParams.radius, params.radius);

        const plotted = new Set<number>();

        data.forEach((val) => {
            if (!plotted.has(val)) {
                plotted.add(val);
                ctx.save();
                ctx.fillStyle = color;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(offsetX + val * valueScale, offsetY, radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            }
        });
    },
};

export { drawPlottedNumbers };
