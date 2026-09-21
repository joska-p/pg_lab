import { initialPalette, type Palette } from '../../core/constants';
import { paletteSchema } from './fetchPalettes.schema';
import { fetchWithValidation } from './fetchWithValidation';

interface CachedPalettes {
    palettes: Palette[];
    expiration: number;
    version: number;
}

const CACHE_KEY = 'palettes';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_VERSION = 2;
const PALETTE_URL = 'https://unpkg.com/nice-color-palettes@3.0.0/1000.json';

const COLOR_NAMES: (keyof Palette)[] = [
    '--color-0',
    '--color-1',
    '--color-2',
    '--color-3',
    '--color-4',
];

function getCachedPalettes(): CachedPalettes | null {
    const stored = localStorage.getItem(CACHE_KEY);

    if (!stored) return null;

    try {
        return JSON.parse(stored) as CachedPalettes;
    } catch {
        return null;
    }
}

function isCacheValid(cache: CachedPalettes): boolean {
    return cache.expiration > Date.now() && cache.version === CACHE_VERSION;
}

function getPaletteId(colors: string[]): string {
    return [...colors].sort().join('-');
}

function createPalette(colors: string[]): Palette {
    const palette = {} as Palette;

    for (let i = 0; i < COLOR_NAMES.length; i++) {
        const colorName = COLOR_NAMES[i];

        palette[colorName] = colors[i] ?? '#000000';
    }

    palette.id = getPaletteId(colors);

    return palette;
}

function cachePalettes(palettes: Palette[]): void {
    const cache: CachedPalettes = {
        palettes,
        expiration: Date.now() + CACHE_DURATION_MS,
        version: CACHE_VERSION,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

async function fetchPalettes(): Promise<Palette[]> {
    const cached = getCachedPalettes();

    if (cached && isCacheValid(cached)) {
        return cached.palettes;
    }

    try {
        const palettesArray = await fetchWithValidation(PALETTE_URL, paletteSchema);
        const palettes = palettesArray.map(createPalette);

        cachePalettes(palettes);

        return palettes;
    } catch (error) {
        console.error('Failed to fetch palettes:', error);

        return [initialPalette];
    }
}

export { fetchPalettes };
