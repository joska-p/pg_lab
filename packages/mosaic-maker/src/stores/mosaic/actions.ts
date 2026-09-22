import { MAX_NUMBER_OF_PALETTES } from '../../core/constants';
import type { TileNames, Palette } from '../../core/constants';
import { fetchPalettes } from '../../utils/palettes/fetchPalettes';
import { computeInitialTiles } from '../../utils/tiles/computeInitialTiles';
import { updateElementStyles } from '../../utils/updateElementStyles';
import { mosaicStore } from './store';

export function regenerateTiles() {
    const { mosaicRef, tileSet } = mosaicStore.getState();

    if (!mosaicRef.current) {
        return;
    }

    mosaicStore.setState({
        tiles: computeInitialTiles(mosaicRef.current, tileSet),
    });
}

function updateCurrentPalettes() {
    const { paletteStock, currentPalettesIndex } = mosaicStore.getState();
    const newIndex =
        currentPalettesIndex >= paletteStock.length - MAX_NUMBER_OF_PALETTES
            ? 0
            : currentPalettesIndex + MAX_NUMBER_OF_PALETTES;
    const currentPalettes = paletteStock.slice(newIndex, newIndex + MAX_NUMBER_OF_PALETTES);

    mosaicStore.setState({ currentPalettesIndex: newIndex, currentPalettes });
}

function setPaletteStock(palettes: Palette[]) {
    const currentPalettes = palettes.slice(0, MAX_NUMBER_OF_PALETTES);

    mosaicStore.setState({ paletteStock: palettes, currentPalettes });
}

export function setRef(ref: React.RefObject<HTMLDivElement | null>) {
    mosaicStore.setState({ mosaicRef: ref });
    regenerateTiles();
}

export function applyPalette(palette: Palette) {
    mosaicStore.setState({ currentPalette: palette });
    const { mosaicRef } = mosaicStore.getState();

    if (mosaicRef.current) {
        updateElementStyles(mosaicRef.current, palette);
    }
}

export function toggleTileInSet(tileName: TileNames) {
    const { tileSet } = mosaicStore.getState();

    if (tileSet.length === 1 && tileName === tileSet[0]) {
        return;
    }

    const newTileSet = tileSet.includes(tileName)
        ? tileSet.filter((tile) => tile !== tileName)
        : [...tileSet, tileName];

    mosaicStore.setState({ tileSet: newTileSet });
    regenerateTiles();
}

export function cyclePalettes() {
    updateCurrentPalettes();
}

export async function initPalettes() {
    mosaicStore.setState({ isPalettesLoading: true });
    const palettes = await fetchPalettes();

    setPaletteStock(palettes);
    mosaicStore.setState({ isPalettesLoading: false });
}
