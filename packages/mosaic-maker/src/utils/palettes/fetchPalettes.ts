import { initialPalette } from '../../core/constants';
import type { Palette } from '../../core/constants';
import { cachedPalettesSchema, paletteSchema } from './fetchPalettes.schema';
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

function getCachedPalettes(): CachedPalettes | null {
    const stored = localStorage.getItem(CACHE_KEY);

    if (!stored) {
        return null;
    }

    try {
        const parsed = cachedPalettesSchema.safeParse(JSON.parse(stored));
        return parsed.success ? parsed.data : null;
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
    return {
        id: getPaletteId(colors),
        '--color-0': colors[0] ?? '#000000',
        '--color-1': colors[1] ?? '#000000',
        '--color-2': colors[2] ?? '#000000',
        '--color-3': colors[3] ?? '#000000',
        '--color-4': colors[4] ?? '#000000',
    };
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
