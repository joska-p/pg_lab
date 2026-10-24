import { PixelData } from './pixel-data';
import type { ManipulationDefinition } from './types';

const TILE_SIZE = 512; // pixels per tile edge

function extractTile({
    imageData,
    tileX,
    tileY,
    tileWidth,
    tileHeight,
    halo,
}: {
    imageData: PixelData;
    tileX: number;
    tileY: number;
    tileWidth: number;
    tileHeight: number;
    halo: number;
}) {
    const paddedX = Math.max(0, tileX - halo);
    const paddedY = Math.max(0, tileY - halo);
    const paddedX2 = Math.min(imageData.width, tileX + tileWidth + halo);
    const paddedY2 = Math.min(imageData.height, tileY + tileHeight + halo);

    const paddedWidth = paddedX2 - paddedX;
    const paddedHeight = paddedY2 - paddedY;

    const tile = new PixelData(paddedWidth, paddedHeight);

    for (let row = 0; row < paddedHeight; row++) {
        const sourceOffset = ((paddedY + row) * imageData.width + paddedX) * 4;

        tile.data.set(
            imageData.data.subarray(sourceOffset, sourceOffset + paddedWidth * 4),
            row * paddedWidth * 4,
        );
    }

    return tile;
}

function blitTile({
    destination,
    tile,
    tileX,
    tileY,
    tileWidth,
    tileHeight,
    halo,
}: {
    destination: PixelData;
    tile: PixelData;
    tileX: number;
    tileY: number;
    tileWidth: number;
    tileHeight: number;
    halo: number;
}) {
    const offsetX = tileX - Math.max(0, tileX - halo);
    const offsetY = tileY - Math.max(0, tileY - halo);

    for (let row = 0; row < tileHeight; row++) {
        const tileOffset = ((offsetY + row) * tile.width + offsetX) * 4;
        const destinationOffset = ((tileY + row) * destination.width + tileX) * 4;

        destination.data.set(
            tile.data.subarray(tileOffset, tileOffset + tileWidth * 4),
            destinationOffset,
        );
    }
}

/**
 * Tiles the image so peak memory stays bounded regardless of image size; the halo padding makes
 * tile edges behave like the middle of the image.
 */
export function runNeighborhoodTiled({
    source,
    definition,
    options,
}: {
    source: PixelData;
    definition: ManipulationDefinition;
    options: Record<string, unknown>;
}) {
    const halo = (definition as { radius?: number }).radius ?? 1;
    const destinationImage = new PixelData(source.width, source.height);

    const columns = Math.ceil(source.width / TILE_SIZE);
    const rows = Math.ceil(source.height / TILE_SIZE);

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const tileX = column * TILE_SIZE;
            const tileY = row * TILE_SIZE;
            const tileWidth = Math.min(TILE_SIZE, source.width - tileX);
            const tileHeight = Math.min(TILE_SIZE, source.height - tileY);

            const tile = extractTile({
                imageData: source,
                tileX,
                tileY,
                tileWidth,
                tileHeight,
                halo,
            });
            const tileOutput = new PixelData(tile.width, tile.height);

            if (definition.access === 'neighborhood') {
                definition.execute({
                    options,
                    source: tile.data,
                    destination: tileOutput.data,
                    width: tile.width,
                    height: tile.height,
                });
            }

            blitTile({
                destination: destinationImage,
                tile: tileOutput,
                tileX,
                tileY,
                tileWidth,
                tileHeight,
                halo,
            });
        }
    }

    return destinationImage;
}
