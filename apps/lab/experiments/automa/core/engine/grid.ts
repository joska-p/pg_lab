import { createSeededRandom } from './rng';

type Grid = Uint8Array;

const createGrid = (rows: number, cols: number): Grid => new Uint8Array(rows * cols);

const seedGrid = (grid: Grid, density: number, seed: number): void => {
    const rng = createSeededRandom(seed);

    for (let i = 0; i < grid.length; i++) {
        grid[i] = rng() < density ? 1 : 0;
    }
};

export { createGrid, seedGrid };
export type { Grid };
