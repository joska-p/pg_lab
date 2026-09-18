import { computeNumberOfTiles } from "./computeNumberOfTiles";
import { generateTileColors } from "./generateTileColors";
import { generateTileRotation } from "./generateTileRotation";
import { getRandom } from "../random/getRandom";
import type { TileSet } from "../../core/constants";
import type { TileInstance } from "../../stores/mosaic/store";

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
