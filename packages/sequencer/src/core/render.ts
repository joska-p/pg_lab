import { getLayer } from './layers/registry';
import type { CanvasLayout, CanvasViewport, LayerConfigEntry } from './types';

function maxAbsInterval(data: number[]): number {
    let max = 0;

    for (let i = 1; i < data.length; i++) {
        const d1 = data[i];
        const d2 = data[i - 1];
        const abs = Math.abs(d1 - d2);

        if (abs > max) {
            max = abs;
        }
    }

    return max || 1;
}

function computeLayout(canvas: HTMLCanvasElement, data: number[]): CanvasLayout {
    let maxVal = 0;
    let minVal = 0;

    for (const value of data) {
        if (value > maxVal) {
            maxVal = value;
        }

        if (value < minVal) {
            minVal = value;
        }
    }

    const dataRange = maxVal - minVal;
    const horizontalScale = (canvas.width * 0.95) / (dataRange || Math.max(maxVal, -minVal) || 1);
    const verticalScale = (canvas.height * 0.85) / maxAbsInterval(data);
    const valueScale = Math.min(horizontalScale, verticalScale);

    return {
        maxVal,
        minVal,
        valueScale,
        offsetX: (canvas.width - (maxVal - minVal) * valueScale) / 2 - minVal * valueScale,
        offsetY: canvas.height / 2,
    };
}

function render(
    canvas: HTMLCanvasElement,
    data: number[],
    layerEntries: LayerConfigEntry[],
    viewport?: CanvasViewport,
): void {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const layout = computeLayout(canvas, data);

    ctx.save();

    if (viewport?.enabled) {
        ctx.translate(viewport.panX, viewport.panY);
        ctx.scale(viewport.zoom, viewport.zoom);
    }

    for (const entry of layerEntries) {
        if (!entry.enabled) {
            continue;
        }

        const layer = getLayer(entry.id);

        if (!layer) {
            continue;
        }

        const params = entry.params;

        ctx.save();
        layer.draw(ctx, data, params, layout);
        ctx.restore();
    }

    ctx.restore();
}

export { render };
