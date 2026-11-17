/*
 * Palette loading with validation and a week-long cache.
 * Browser APIs are limited to fetch/Web Storage: no document access lives here.
 */

import { COLOR_KEYS, initialPalette } from './constants';
import type { Palette } from './constants';

interface CachedPalettes {
    palettes: Palette[];
    expiration: number;
    version: number;
}

const CACHE_KEY = 'palettes';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_VERSION = 2;
const PALETTE_URL = 'https://unpkg.com/nice-color-palettes@3.0.0/1000.json';

const REQUIRED_PALETTE_KEYS: readonly string[] = ['id', ...COLOR_KEYS];

function getField(value: object, key: string): unknown {
    return Object.hasOwn(value, key) ? Reflect.get(value, key) : undefined;
}

function isColorStrings(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.length >= 5 &&
        value.every(
            (item) =>
                typeof item === 'string' &&
                item.startsWith('#') &&
                item.length >= 3 &&
                item.length <= 9,
        )
    );
}

function isPaletteArrays(value: unknown): value is string[][] {
    return Array.isArray(value) && value.length >= 1 && value.every(isColorStrings);
}

function isPalette(value: unknown): value is Palette {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const entries = Object.entries(value);

    return (
        REQUIRED_PALETTE_KEYS.every((key) => entries.some(([entryKey]) => entryKey === key)) &&
        entries.every(([, item]) => typeof item === 'string')
    );
}

function isCachedPalettes(value: unknown): value is CachedPalettes {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const palettes = getField(value, 'palettes');
    const expiration = getField(value, 'expiration');
    const version = getField(value, 'version');

    return (
        Array.isArray(palettes) &&
        palettes.every(isPalette) &&
        typeof expiration === 'number' &&
        typeof version === 'number'
    );
}

function getStorage(): Storage | null {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
        return null;
    }
}

function getCachedPalettes(storage: Storage | null): CachedPalettes | null {
    if (!storage) {
        return null;
    }

    let stored: string | null;

    try {
        stored = storage.getItem(CACHE_KEY);
    } catch {
        return null;
    }

    if (!stored) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(stored);

        return isCachedPalettes(parsed) ? parsed : null;
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

function cachePalettes(storage: Storage | null, palettes: Palette[]): void {
    if (!storage) {
        return;
    }

    const cache: CachedPalettes = {
        palettes,
        expiration: Date.now() + CACHE_DURATION_MS,
        version: CACHE_VERSION,
    };

    try {
        storage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Private browsing or a full quota must not prevent rendering.
    }
}

async function fetchWithValidation(url: string): Promise<string[][]> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Palette request failed: ${String(response.status)}`);
    }

    const data: unknown = await response.json();

    if (!isPaletteArrays(data)) {
        throw new Error('Invalid palette payload');
    }

    return data;
}

async function fetchPalettes(storage: Storage | null = getStorage()): Promise<Palette[]> {
    const cached = getCachedPalettes(storage);

    if (cached && isCacheValid(cached)) {
        return cached.palettes;
    }

    try {
        const palettesArray = await fetchWithValidation(PALETTE_URL);
        const palettes = palettesArray.map(createPalette);

        cachePalettes(storage, palettes);

        return palettes;
    } catch (error) {
        console.error('Failed to fetch palettes:', error);

        return [initialPalette];
    }
}

export { fetchPalettes };
