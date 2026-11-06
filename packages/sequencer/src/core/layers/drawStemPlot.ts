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
        const { valueScale, offsetX, offsetY, maxVal } = layout;
        const lineWidth = typeof params.lineWidth === 'number' ? params.lineWidth : 1;
        const alpha = typeof params.alpha === 'number' ? params.alpha : 0.7;
        const markerRadius = typeof params.markerRadius === 'number' ? params.markerRadius : 3;
        const saturation = typeof params.saturation === 'number' ? params.saturation : 75;
        const lightness = typeof params.lightness === 'number' ? params.lightness : 60;

        if (data.length === 0 || maxVal === 0) {
            return;
        }

        ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = alpha;

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

            if (markerRadius > 0) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, offsetY - stemLen, markerRadius, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        ctx.restore();
    },
};

export { drawStemPlot };
