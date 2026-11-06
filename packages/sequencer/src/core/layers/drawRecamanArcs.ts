import type { VisualLayer } from '../types';

export const drawRecamanArcs: VisualLayer = {
    id: 'recaman-arcs',
    name: 'Recamán Arcs',
    description: 'Semicircle arcs between consecutive sequence values',
    category: 'drawing',
    params: {
        lineWidth: {
            type: 'number',
            label: 'Line Width',
            min: 0.5,
            max: 5,
            step: 0.5,
            default: 1,
        },
        alpha: {
            type: 'number',
            label: 'Opacity',
            min: 0,
            max: 1,
            step: 0.05,
            default: 1.0,
        },
        color: { type: 'color', label: 'Color', default: '' },
    },
    draw: (ctx, data, params, layout) => {
        const { valueScale, offsetX, offsetY } = layout;
        const lineWidth = typeof params.lineWidth === 'number' ? params.lineWidth : 1;
        const alpha = typeof params.alpha === 'number' ? params.alpha : 1;
        const color = typeof params.color === 'string' ? params.color : '';

        if (data.length < 2) {
            return;
        }

        ctx.save();
        ctx.translate(offsetX, offsetY);

        ctx.strokeStyle = color || getComputedStyle(ctx.canvas).color || 'black';
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = alpha;

        data.forEach((value, index) => {
            if (index === 0) {
                return;
            }

            const previousValue = data[index - 1];
            if (previousValue === undefined) {
                return;
            }

            const middleValue = ((previousValue + value) / 2) * valueScale;
            const radius = (Math.abs(value - previousValue) / 2) * valueScale;

            ctx.beginPath();

            if (index % 2 === 0) {
                ctx.arc(middleValue, 0, radius, 0, Math.PI);
            } else {
                ctx.arc(middleValue, 0, radius, Math.PI, 0);
            }

            ctx.stroke();
        });

        ctx.restore();
    },
};
