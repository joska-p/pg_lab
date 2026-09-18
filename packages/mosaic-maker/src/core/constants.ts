export const initialTileSet = [
  "CornerCircles",
  "Diamond",
  "MiddleCircle",
  "OppositeCircles",
  "Rainbow",
  "Square",
  "Triangles",
  "Cube",
] as const;

export type TileNames = (typeof initialTileSet)[number];
export type TileSet = TileNames[];

export const CSS_VARS = {
  size: "--tile-size",
  gap: "--mosaicGap",
} as const;

export const MAX_NUMBER_OF_PALETTES = 42;
export const DEFAULT_TILE_SIZE = 64;
export const DEFAULT_GAP_SIZE = 0;

export const initialTileSize = {
  [CSS_VARS.size]: `${String(DEFAULT_TILE_SIZE)}px`,
};

export const initialGapSize = {
  [CSS_VARS.gap]: `${String(DEFAULT_GAP_SIZE)}px`,
};

export const initialRotations = {
  "--rotation-0": "0deg",
  "--rotation-1": "90deg",
  "--rotation-2": "180deg",
  "--rotation-3": "270deg",
};

export interface Palette {
  id: string;
  "--color-0": string;
  "--color-1": string;
  "--color-2": string;
  "--color-3": string;
  "--color-4": string;
  [key: string]: string;
}

export const initialPalette: Palette = {
  id: "initial",
  "--color-0": "#333333",
  "--color-1": "#555555",
  "--color-2": "#777777",
  "--color-3": "#999999",
  "--color-4": "#bbbbbb",
};
