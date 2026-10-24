import type { VisualLayer } from '../types';

const drawFactorWaves: VisualLayer = {
    id: 'factor-waves',
    name: 'Factor Waves',
    description: 'Per-value sine waves radiating from each point',
    category: 'drawing',
    params: {
        lineWidth: {
            label: 'Line Width',
            type: 'number',
            min: 0.5,
            max: 5,
            step: 0.5,
            default: 1.5,
        },
        alpha: {
            label: 'Opacity',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.05,
            default: 0.65,
        },
        amplitudeScale: {
            label: 'Amplitude',
            type: 'number',
            min: 0.05,
            max: 1,
            step: 0.05,
            default: 0.4,
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
    },
    draw: (ctx, data, params, layout) => {
        const {
            lineWidth = 1.5,
            alpha = 0.65,
            amplitudeScale = 0.4,
            saturation = 85,
            lightness = 55,
        } = params;
        const { maxVal, valueScale, offsetX, offsetY } = layout;

        if (maxVal <= 0) {
            return;
        }

        const maxAmplitude = ctx.canvas.height * (amplitudeScale as number);

        data.forEach((p) => {
            const amplitude = (p / maxVal) * maxAmplitude;
            const hue = (p * 137.5) % 360;

            ctx.save();
            ctx.strokeStyle = `hsla(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%, ${String(alpha)})`;
            ctx.lineWidth = lineWidth as number;
            ctx.beginPath();

            const startX = offsetX + p * valueScale;
            const endX = offsetX + maxVal * valueScale;

            for (let canvasX = startX; canvasX <= endX; canvasX++) {
                const v = (canvasX - offsetX) / valueScale;
                const y = offsetY + amplitude * Math.sin((Math.PI * (v - p)) / p);

                if (canvasX === startX) {
                    ctx.moveTo(canvasX, y);
                } else {
                    ctx.lineTo(canvasX, y);
                }
            }

            ctx.stroke();
            ctx.restore();
        });
    },
};

export { drawFactorWaves };
