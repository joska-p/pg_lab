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
        const { lineWidth, alpha, color } = params;

        if (data.length < 2) {
            return;
        }

        ctx.save();
        ctx.translate(offsetX, offsetY);

        ctx.strokeStyle = (color as string) || getComputedStyle(ctx.canvas).color || 'black';
        ctx.lineWidth = lineWidth as number;
        ctx.globalAlpha = alpha as number;

        data.forEach((value, index) => {
            const previousValue = data[index - 1];

            if (index > 0) {
                const middleValue = ((previousValue + value) / 2) * valueScale;
                const radius = (Math.abs(value - previousValue) / 2) * valueScale;

                ctx.beginPath();

                if (index % 2 === 0) {
                    ctx.arc(middleValue, 0, radius, 0, Math.PI);
                } else {
                    ctx.arc(middleValue, 0, radius, Math.PI, 0);
                }

                ctx.stroke();
            }
        });

        ctx.restore();
    },
};
