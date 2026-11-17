/*
 * Tile generation: decide how many tiles fit in the mosaic, then give each one
 * a shape, a shuffled set of color variables and a rotation variable.
 */

import { COLOR_KEYS, CSS_VARS, initialRotations } from './constants';
import type { ColorKey, TileNames, TileSet } from './constants';
import { getRandom, shuffleArray } from './random';

export interface TileInstance {
    id: string;
    name: TileNames;
    colors: [ColorKey, ColorKey, ColorKey, ColorKey, ColorKey];
    rotation: string;
}

function parseNumericValue(value: string): number {
    const parsed = Number.parseFloat(value);

    if (Number.isNaN(parsed)) {
        throw new Error(`Invalid numeric value: ${value}`);
    }

    return parsed;
}

/** Pure sizing calculation, kept separate from the DOM measurement below. */
function computeTileCount(width: number, height: number, tileSize: number, gap: number): number {
    if (width <= 0 || height <= 0 || tileSize <= 0) {
        return 0;
    }

    const tilesPerRow = Math.floor((width + gap) / (tileSize + gap));
    const tilesPerColumn = Math.floor((height + gap) / (tileSize + gap));

    return Math.max(0, tilesPerRow * tilesPerColumn);
}

function computeNumberOfTiles(element: HTMLElement): number {
    try {
        const style = getComputedStyle(element);
        const gap = parseNumericValue(style.getPropertyValue(CSS_VARS.gap));
        const tileSize = parseNumericValue(style.getPropertyValue(CSS_VARS.size));

        return computeTileCount(element.clientWidth, element.clientHeight, tileSize, gap);
    } catch (error) {
        console.error('Failed to compute number of tiles:', error);

        return 0;
    }
}

function generateTileColors(): [ColorKey, ColorKey, ColorKey, ColorKey, ColorKey] {
    const keys: [ColorKey, ColorKey, ColorKey, ColorKey, ColorKey] = [...COLOR_KEYS];

    return shuffleArray(keys);
}

function generateTileRotation(): string {
    return getRandom(Object.keys(initialRotations));
}

function computeInitialTiles(element: HTMLElement, tileSet: TileSet): TileInstance[] {
    const numberOfTiles = computeNumberOfTiles(element);

    return Array.from({ length: numberOfTiles }, (_, index) => ({
        id: String(index),
        name: getRandom(tileSet),
        colors: generateTileColors(),
        rotation: generateTileRotation(),
    }));
}

export {
    computeInitialTiles,
    computeNumberOfTiles,
    computeTileCount,
    generateTileColors,
    generateTileRotation,
};
