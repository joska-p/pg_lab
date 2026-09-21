import { CSS_VARS } from '../../core/constants';

function parseNumericValue(value: string): number {
    const parsed = Number.parseFloat(value);

    if (Number.isNaN(parsed)) {
        throw new Error(`Invalid numeric value: ${value}`);
    }

    return parsed;
}

function computeNumberOfTiles(element: HTMLDivElement): number {
    try {
        const style = getComputedStyle(element);
        const gap = parseNumericValue(style.getPropertyValue(CSS_VARS.gap));
        const width = element.clientWidth;
        const height = element.clientHeight;

        if (width === 0 || height === 0) return 0;

        const tileSize = parseNumericValue(style.getPropertyValue(CSS_VARS.size));

        const tilesPerRow = Math.floor((width + gap) / (tileSize + gap));
        const tilesPerColumn = Math.floor((height + gap) / (tileSize + gap));

        return Math.max(0, tilesPerRow * tilesPerColumn);
    } catch (error) {
        console.error('Failed to compute number of tiles:', error);

        return 0;
    }
}

export { computeNumberOfTiles };
