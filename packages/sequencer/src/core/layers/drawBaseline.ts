import { readParam } from '../param';
import type { VisualLayer } from '../types';

const baselineParams = {
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
        default: 0.15,
    },
    color: { label: 'Color', type: 'color', default: '' },
} as const;

const drawBaseline: VisualLayer = {
    id: 'baseline',
    name: 'Baseline',
    description: 'Horizontal line at y=0',
    category: 'cosmetic',
    params: baselineParams,
    draw: (ctx, _data, params, layout) => {
        const { minVal, maxVal, valueScale, offsetX, offsetY } = layout;
        const color = readParam(baselineParams.color, params.color);
        const lineWidth = readParam(baselineParams.lineWidth, params.lineWidth);
        const alpha = readParam(baselineParams.alpha, params.alpha);

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(offsetX + minVal * valueScale, offsetY);
        ctx.lineTo(offsetX + maxVal * valueScale, offsetY);
        ctx.stroke();
        ctx.restore();
    },
};

export { drawBaseline };
