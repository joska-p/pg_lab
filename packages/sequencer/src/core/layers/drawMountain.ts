import type { VisualLayer } from '../types';

const drawMountain: VisualLayer = {
    id: 'mountain',
    name: 'Mountain Fill',
    description: 'Filled area under the sequence curve with gradient',
    category: 'drawing',
    params: {
        alpha: {
            label: 'Opacity',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.05,
            default: 0.4,
        },
        hue: { label: 'Hue', type: 'number', min: 0, max: 360, step: 10, default: 210 },
        saturation: {
            label: 'Saturation',
            type: 'number',
            min: 0,
            max: 100,
            step: 5,
            default: 70,
        },
        lightness: {
            label: 'Lightness',
            type: 'number',
            min: 0,
            max: 100,
            step: 5,
            default: 50,
        },
        gradientHeight: {
            label: 'Gradient Height',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.1,
            default: 0.5,
        },
    },
    draw: (ctx, data, params, layout) => {
        const { valueScale, offsetX, offsetY } = layout;
        const alpha = typeof params.alpha === 'number' ? params.alpha : 0.4;
        const hue = typeof params.hue === 'number' ? params.hue : 210;
        const saturation = typeof params.saturation === 'number' ? params.saturation : 70;
        const lightness = typeof params.lightness === 'number' ? params.lightness : 50;
        const gradientHeight =
            typeof params.gradientHeight === 'number' ? params.gradientHeight : 0.5;

        if (data.length < 2) {
            return;
        }

        const gradHeight = ctx.canvas.height * gradientHeight;
        const gradY = offsetY - gradHeight / 2;

        const gradient = ctx.createLinearGradient(0, gradY, 0, gradY + gradHeight);

        gradient.addColorStop(
            0,
            `hsla(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%, ${String(alpha)})`,
        );
        gradient.addColorStop(
            1,
            `hsla(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%, 0)`,
        );

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();

        // data.length >= 2 (garanti plus haut) : extrémités définies.
        const d0 = data[0];
        if (d0 === undefined) {
            return;
        }

        ctx.moveTo(offsetX + d0 * valueScale, offsetY);

        for (let i = 1; i < data.length; i++) {
            const d = data[i];
            if (d === undefined) {
                continue;
            }

            ctx.lineTo(offsetX + d * valueScale, offsetY);
        }

        const dLast = data[data.length - 1];
        if (dLast === undefined) {
            return;
        }

        ctx.lineTo(offsetX + dLast * valueScale, offsetY + gradHeight);
        ctx.lineTo(offsetX + d0 * valueScale, offsetY + gradHeight);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },
};

export { drawMountain };
