import { shuffleArray } from '../random/shuffleArray';

const CSS_VAR_KEYS = ['--color-0', '--color-1', '--color-2', '--color-3', '--color-4'] as const;

function generateTileColors(): [string, string, string, string, string] {
    return shuffleArray([...CSS_VAR_KEYS]);
}

export { generateTileColors };
