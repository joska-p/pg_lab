import type { VisualLayer } from '../types';

const drawConnectionLines: VisualLayer = {
    id: 'connection-lines',
    name: 'Connection Lines',
    description: 'Lines connecting consecutive values, color-cycled by index',
    category: 'drawing',
    params: {
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
    },
    draw: (ctx, data, params, layout) => {
        const { valueScale, offsetX, offsetY } = layout;
        const lineWidth = typeof params.lineWidth === 'number' ? params.lineWidth : 1.5;
        const alpha = typeof params.alpha === 'number' ? params.alpha : 0.8;
        const hueCycle = typeof params.hueCycle === 'number' ? params.hueCycle : 360;
        const saturation = typeof params.saturation === 'number' ? params.saturation : 80;
        const lightness = typeof params.lightness === 'number' ? params.lightness : 60;

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
