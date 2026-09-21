import type { TileSet } from '../../core/constants';
import type { TileInstance } from '../../stores/mosaic/store';
import { getRandom } from '../random/getRandom';
import { computeNumberOfTiles } from './computeNumberOfTiles';
import { generateTileColors } from './generateTileColors';
import { generateTileRotation } from './generateTileRotation';

function computeInitialTiles(element: HTMLDivElement, tileSet: TileSet): TileInstance[] {
    const numberOfTiles = computeNumberOfTiles(element);

    return Array.from({ length: numberOfTiles }, (_, i) => ({
        id: String(i),
        name: getRandom(tileSet),
        colors: generateTileColors(),
        rotation: generateTileRotation(),
    }));
}

export { computeInitialTiles };
