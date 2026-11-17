import { getLayer } from './layers/registry';
import type { CanvasLayout, CanvasViewport, LayerConfigEntry, RenderSize } from './types';

function maxAbsInterval(data: number[]): number {
    let max = 0;
    let previous: number | undefined;

    for (const value of data) {
        if (value === undefined) {
            continue;
        }

        if (previous !== undefined) {
            const abs = Math.abs(value - previous);
            if (abs > max) {
                max = abs;
            }
        }

        previous = value;
    }

    return max || 1;
}

function computeLayout(size: RenderSize, data: number[]): CanvasLayout {
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
    const horizontalScale = (size.width * 0.95) / (dataRange || Math.max(maxVal, -minVal) || 1);
    const verticalScale = (size.height * 0.85) / maxAbsInterval(data);
    const valueScale = Math.min(horizontalScale, verticalScale);

    return {
        maxVal,
        minVal,
        valueScale,
        offsetX: (size.width - (maxVal - minVal) * valueScale) / 2 - minVal * valueScale,
        offsetY: size.height / 2,
    };
}

function render(
    canvas: HTMLCanvasElement,
    size: RenderSize,
    data: number[],
    layerEntries: LayerConfigEntry[],
    viewport?: CanvasViewport,
): void {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    ctx.clearRect(0, 0, size.width, size.height);

    const layout = computeLayout(size, data);

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
