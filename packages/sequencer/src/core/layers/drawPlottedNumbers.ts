import type { VisualLayer } from '../types';

const drawPlottedNumbers: VisualLayer = {
    id: 'plotted-numbers',
    name: 'Plotted Numbers',
    description: 'Dots at each unique sequence value',
    category: 'cosmetic',
    params: {
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
    },
    draw: (ctx, data, params, layout) => {
        const { radius = 3, alpha = 0.4, color } = params;
        const { valueScale, offsetX, offsetY } = layout;

        const plotted = new Set<number>();

        data.forEach((val) => {
            if (!plotted.has(val)) {
                plotted.add(val);
                ctx.save();
                ctx.fillStyle = color as string;
                ctx.globalAlpha = alpha as number;
                ctx.beginPath();
                ctx.arc(offsetX + val * valueScale, offsetY, radius as number, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();
            }
        });
    },
};

export { drawPlottedNumbers };
