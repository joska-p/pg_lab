import type { VisualLayer } from '../types';

const drawStemPlot: VisualLayer = {
    id: 'stem-plot',
    name: 'Stem Plot',
    description: 'Vertical stems from baseline with marker dots at each value',
    category: 'drawing',
    params: {
        lineWidth: {
            label: 'Line Width',
            type: 'number',
            min: 0.5,
            max: 5,
            step: 0.5,
            default: 1,
        },
        alpha: {
            label: 'Opacity',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.05,
            default: 0.7,
        },
        markerRadius: {
            label: 'Marker Radius',
            type: 'number',
            min: 1,
            max: 12,
            step: 1,
            default: 3,
        },
        saturation: {
            label: 'Saturation',
            type: 'number',
            min: 0,
            max: 100,
            step: 5,
            default: 75,
        },
        lightness: {
            label: 'Lightness',
            type: 'number',
            min: 0,
            max: 100,
            step: 5,
            default: 60,
        },
    },
    draw: (ctx, data, params, layout) => {
        const {
            lineWidth = 1,
            alpha = 0.7,
            markerRadius = 3,
            saturation = 75,
            lightness = 60,
        } = params;
        const { valueScale, offsetX, offsetY, maxVal } = layout;

        if (data.length === 0 || maxVal === 0) {
            return;
        }

        ctx.save();
        ctx.lineWidth = lineWidth as number;
        ctx.globalAlpha = alpha as number;

        data.forEach((val, i) => {
            const x = offsetX + val * valueScale;
            const stemLen = val * valueScale;
            const hue = (i * 137.5) % 360;
            const color = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;

            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, offsetY);
            ctx.lineTo(x, offsetY - stemLen);
            ctx.stroke();

            if ((markerRadius as number) > 0) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, offsetY - stemLen, markerRadius as number, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        ctx.restore();
    },
};

export { drawStemPlot };
