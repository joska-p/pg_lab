import type { VisualLayer } from '../types';

const drawRadialSpokes: VisualLayer = {
    id: 'radial-spokes',
    name: 'Radial Spokes',
    description: 'Values mapped to polar coordinates — each point is a spoke from center',
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
        dotRadius: {
            label: 'Dot Radius',
            type: 'number',
            min: 0,
            max: 10,
            step: 1,
            default: 2,
        },
        saturation: {
            label: 'Saturation',
            type: 'number',
            min: 0,
            max: 100,
            step: 5,
            default: 85,
        },
        lightness: {
            label: 'Lightness',
            type: 'number',
            min: 0,
            max: 100,
            step: 5,
            default: 55,
        },
        scale: { label: 'Scale', type: 'number', min: 0.1, max: 2, step: 0.1, default: 0.8 },
    },
    draw: (ctx, data, params, layout) => {
        const {
            lineWidth = 1,
            alpha = 0.7,
            dotRadius = 2,
            saturation = 85,
            lightness = 55,
            scale = 0.8,
        } = params;
        const { maxVal, offsetX, offsetY } = layout;

        if (data.length === 0) {
            return;
        }

        const cx = offsetX;
        const cy = offsetY;
        const maxR = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4 * (scale as number);
        const maxData = maxVal || 1;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.lineWidth = lineWidth as number;
        ctx.globalAlpha = alpha as number;

        data.forEach((val, i) => {
            const angle = (i / data.length) * 2 * Math.PI - Math.PI / 2;
            const r = (Math.abs(val) / maxData) * maxR;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            const hue = (i * 137.5) % 360;

            ctx.strokeStyle = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.stroke();

            if ((dotRadius as number) > 0) {
                ctx.fillStyle = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;
                ctx.beginPath();
                ctx.arc(x, y, dotRadius as number, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        ctx.restore();
    },
};

export { drawRadialSpokes };
