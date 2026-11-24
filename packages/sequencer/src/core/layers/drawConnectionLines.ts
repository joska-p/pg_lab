import { readParam } from '../param';
import type { VisualLayer } from '../types';

const connectionLinesParams = {
    lineWidth: {
        label: 'Line Width',
        type: 'number',
        min: 0.5,
        max: 8,
        step: 0.5,
        default: 1.5,
    },
    alpha: {
        label: 'Opacity',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.8,
    },
    hueCycle: {
        label: 'Hue Cycle',
        type: 'number',
        min: 60,
        max: 720,
        step: 30,
        default: 360,
    },
    saturation: {
        label: 'Saturation',
        type: 'number',
        min: 0,
        max: 100,
        step: 5,
        default: 80,
    },
    lightness: {
        label: 'Lightness',
        type: 'number',
        min: 0,
        max: 100,
        step: 5,
        default: 60,
    },
} as const;

const drawConnectionLines: VisualLayer = {
    id: 'connection-lines',
    name: 'Connection Lines',
    description: 'Lines connecting consecutive values, color-cycled by index',
    category: 'drawing',
    params: connectionLinesParams,
    draw: (ctx, data, params, layout) => {
        const { valueScale, offsetX, offsetY } = layout;
        const lineWidth = readParam(connectionLinesParams.lineWidth, params.lineWidth);
        const alpha = readParam(connectionLinesParams.alpha, params.alpha);
        const hueCycle = readParam(connectionLinesParams.hueCycle, params.hueCycle);
        const saturation = readParam(connectionLinesParams.saturation, params.saturation);
        const lightness = readParam(connectionLinesParams.lightness, params.lightness);

        if (data.length < 2) {
            return;
        }

        ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = alpha;

        // data.length >= 2 (garanti plus haut) : premier élément défini.
        let previous = data[0];
        if (previous === undefined) {
            return;
        }

        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            if (current === undefined) {
                continue;
            }
            const hue = ((i / data.length) * hueCycle) % 360;

            ctx.strokeStyle = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;
            ctx.beginPath();
            ctx.moveTo(offsetX + previous * valueScale, offsetY);
            ctx.lineTo(offsetX + current * valueScale, offsetY);
            ctx.stroke();
            previous = current;
        }

        ctx.restore();
    },
};

export { drawConnectionLines };
