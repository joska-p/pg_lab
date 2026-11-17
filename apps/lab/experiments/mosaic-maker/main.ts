/*
 * Mosaic Maker: the static HTML owns the shell and the control layout.
 * This module only augments them. Tile SVGs and palette buttons are created
 * once, then patched in place — the mosaic container is never rebuilt.
 * Module variables hold the palette stock and tile set; the DOM holds the
 * CSS variables, control values and pressed/checked states.
 */

import { createSlider } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';
import {
    COLOR_KEYS,
    CSS_VARS,
    DEFAULT_GAP_SIZE,
    DEFAULT_TILE_SIZE,
    MAX_NUMBER_OF_PALETTES,
    initialGapSize,
    initialPalette,
    initialRotations,
    initialTileSet,
    initialTileSize,
} from './core/constants';
import type { Palette, TileNames } from './core/constants';
import { fetchPalettes } from './core/palettes';
import { shuffleObject } from './core/random';
import {
    createTilePreview,
    createTileSvg,
    updateElementStyles,
    updateTileElement,
} from './core/render';
import type { TileSvg } from './core/render';
import { computeInitialTiles } from './core/tiles';
import type { TileInstance } from './core/tiles';

const REGENERATE_DELAY_MS = 150;

function required<T extends Element>(selector: string, root: ParentNode = document): T {
    const element = root.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Mosaic Maker markup is incomplete: ${selector}`);
    }

    return element;
}

const mosaic = required<HTMLElement>('[data-mosaic]');
const status = required<HTMLElement>('[data-status]');
const paletteStatus = required<HTMLElement>('[data-palette-status]');
const palettesMount = required<HTMLElement>('[data-palettes]');
const tileSetMount = required<HTMLElement>('[data-tile-set]');
const tileSizeMount = required<HTMLElement>('[data-control="tile-size"]');
const gapMount = required<HTMLElement>('[data-control="gap"]');
const tileSizeOutput = required<HTMLOutputElement>('[data-value="tile-size"]');
const gapOutput = required<HTMLOutputElement>('[data-value="gap"]');
const shuffleColorsButton = required<HTMLButtonElement>('[data-shuffle-colors]');
const shuffleRotationsButton = required<HTMLButtonElement>('[data-shuffle-rotations]');
const cyclePalettesButton = required<HTMLButtonElement>('[data-cycle-palettes]');
const regenerateButton = required<HTMLButtonElement>('[data-regenerate]');

const tileButtons: { name: TileNames; button: HTMLButtonElement }[] = initialTileSet.map(
    (name) => ({
        name,
        button: required<HTMLButtonElement>(`[data-tile="${name}"]`, tileSetMount),
    }),
);

/* Module state: no store, no React, no reconciliation. */
let paletteStock: Palette[] = [initialPalette];
let currentPalettesIndex = 0;
let currentPalettes: Palette[] = [initialPalette];
let currentPalette: Palette = initialPalette;
let tileSet: TileNames[] = [...initialTileSet];
let isPalettesLoading = true;
let regenerateTimer: ReturnType<typeof setTimeout> | null = null;

const tilePool: TileSvg[] = [];

interface PaletteOption {
    button: HTMLButtonElement;
    swatches: HTMLSpanElement[];
}

const paletteOptions: PaletteOption[] = [];

/** Only the five color variables are shuffled: `id` must never become a color. */
function colorVariables(palette: Palette): Record<string, string> {
    const variables: Record<string, string> = {};

    for (const key of COLOR_KEYS) {
        const value = palette[key];

        if (value) {
            variables[key] = value;
        }
    }

    return variables;
}

function shuffleColors(): void {
    updateElementStyles(mosaic, shuffleObject(colorVariables(currentPalette)));
}

function shuffleRotations(): void {
    updateElementStyles(mosaic, shuffleObject(initialRotations));
}

function syncTileButtons(): void {
    const locked = tileSet.length === 1;

    for (const { name, button } of tileButtons) {
        const selected = tileSet.includes(name);
        const isLastSelected = selected && locked;
        const label = button.getAttribute('aria-label') ?? name;

        button.setAttribute('aria-pressed', String(selected));
        button.disabled = isLastSelected;
        button.title = isLastSelected ? `${label} — garder au moins une forme` : label;
    }
}

/** Grow the SVG pool when needed; detach surplus tiles instead of rebuilding. */
function renderTiles(tiles: TileInstance[]): void {
    while (tilePool.length < tiles.length) {
        tilePool.push(createTileSvg('pg-mosaic__tile'));
    }

    tilePool.forEach((tile, index) => {
        const instance = tiles[index];

        if (!instance) {
            tile.svg.remove();

            return;
        }

        updateTileElement(tile, instance);

        if (tile.svg.parentNode !== mosaic) {
            mosaic.append(tile.svg);
        }
    });

    status.textContent = `${String(tiles.length)} tuiles affichées.`;
}

function regenerateTiles(): void {
    renderTiles(computeInitialTiles(mosaic, tileSet));
}

function toggleTileInSet(name: TileNames): void {
    if (tileSet.length === 1 && tileSet[0] === name) {
        return;
    }

    tileSet = tileSet.includes(name) ? tileSet.filter((tile) => tile !== name) : [...tileSet, name];

    syncTileButtons();
    regenerateTiles();
}

function syncPaletteOptions(): void {
    paletteOptions.forEach((option, index) => {
        const palette = currentPalettes[index];

        if (!palette) {
            option.button.hidden = true;

            return;
        }

        const selected = palette.id === currentPalette.id;

        option.button.hidden = false;
        option.button.setAttribute('aria-checked', String(selected));
        option.button.setAttribute(
            'aria-label',
            `Palette ${String(index + 1)} sur ${String(currentPalettes.length)} : ${palette.id}`,
        );
        option.button.title = palette.id;

        option.swatches.forEach((swatch, colorIndex) => {
            swatch.style.backgroundColor =
                palette[COLOR_KEYS[colorIndex] ?? '--color-0'] ?? '#000000';
        });
    });
}

function applyPalette(palette: Palette): void {
    currentPalette = palette;
    updateElementStyles(mosaic, colorVariables(palette));
    syncPaletteOptions();
}

function createPaletteOptions(): void {
    for (let index = 0; index < MAX_NUMBER_OF_PALETTES; index += 1) {
        const button = document.createElement('button');
        const strip = document.createElement('span');
        const swatches: HTMLSpanElement[] = [];

        button.type = 'button';
        button.className = 'pg-mosaic__palette-option';
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', 'false');
        button.hidden = true;

        strip.className = 'pg-mosaic__palette-strip';
        strip.setAttribute('aria-hidden', 'true');

        for (let colorIndex = 0; colorIndex < COLOR_KEYS.length; colorIndex += 1) {
            const swatch = document.createElement('span');

            swatch.className = 'pg-mosaic__palette-swatch';
            strip.append(swatch);
            swatches.push(swatch);
        }

        const paletteIndex = index;

        button.addEventListener('click', () => {
            const palette = currentPalettes[paletteIndex];

            if (palette) {
                applyPalette(palette);
            }
        });

        button.append(strip);
        palettesMount.append(button);
        paletteOptions.push({ button, swatches });
    }
}

function setPaletteStock(palettes: Palette[]): void {
    paletteStock = palettes;
    currentPalettesIndex = 0;
    currentPalettes = palettes.slice(0, MAX_NUMBER_OF_PALETTES);
}

function updateCurrentPalettes(): void {
    const newIndex =
        currentPalettesIndex >= paletteStock.length - MAX_NUMBER_OF_PALETTES
            ? 0
            : currentPalettesIndex + MAX_NUMBER_OF_PALETTES;

    currentPalettesIndex = newIndex;
    currentPalettes = paletteStock.slice(newIndex, newIndex + MAX_NUMBER_OF_PALETTES);
}

function cyclePalettes(): void {
    if (isPalettesLoading) {
        return;
    }

    updateCurrentPalettes();
    syncPaletteOptions();
}

function setPaletteStatus(message: string, loading: boolean): void {
    paletteStatus.textContent = message;
    paletteStatus.classList.toggle('is-loading', loading);
    cyclePalettesButton.disabled = loading;
}

async function initPalettes(): Promise<void> {
    isPalettesLoading = true;
    setPaletteStatus('Chargement des palettes…', true);

    const palettes = await fetchPalettes();

    setPaletteStock(palettes);
    isPalettesLoading = false;

    const label = palettes.length > 1 ? 'palettes disponibles.' : 'palette disponible.';

    setPaletteStatus(`${String(palettes.length)} ${label}`, false);
    syncPaletteOptions();
}

function scheduleRegeneration(): void {
    if (regenerateTimer !== null) {
        clearTimeout(regenerateTimer);
    }

    regenerateTimer = setTimeout(() => {
        regenerateTimer = null;
        regenerateTiles();
    }, REGENERATE_DELAY_MS);
}

function cancelRegeneration(): void {
    if (regenerateTimer !== null) {
        clearTimeout(regenerateTimer);
        regenerateTimer = null;
    }
}

const tileSizeSlider = createSlider(tileSizeMount, {
    min: 32,
    max: 256,
    step: 2,
    value: DEFAULT_TILE_SIZE,
});
const gapSlider = createSlider(gapMount, {
    min: 0,
    max: 64,
    step: 2,
    value: DEFAULT_GAP_SIZE,
});

tileSizeSlider.addEventListener('input', () => {
    const value = Number(tileSizeSlider.value);

    mosaic.style.setProperty(CSS_VARS.size, `${String(value)}px`);
    tileSizeOutput.textContent = `${String(value)} px`;
    scheduleRegeneration();
});

gapSlider.addEventListener('input', () => {
    const value = Number(gapSlider.value);

    mosaic.style.setProperty(CSS_VARS.gap, `${String(value)}px`);
    gapOutput.textContent = `${String(value)} px`;
    scheduleRegeneration();
});

shuffleColorsButton.addEventListener('click', shuffleColors);
shuffleRotationsButton.addEventListener('click', shuffleRotations);
cyclePalettesButton.addEventListener('click', cyclePalettes);
regenerateButton.addEventListener('click', () => {
    cancelRegeneration();
    regenerateTiles();
});

for (const { name, button } of tileButtons) {
    const previewMount = required<HTMLElement>(`[data-tile-preview="${name}"]`, tileSetMount);

    previewMount.append(createTilePreview(name, 'pg-mosaic__tile-preview-svg'));
    button.addEventListener('click', () => toggleTileInSet(name));
}

function initialize(): void {
    updateElementStyles(mosaic, {
        ...colorVariables(initialPalette),
        ...initialTileSize,
        ...initialGapSize,
        ...initialRotations,
    });
    tileSizeOutput.textContent = `${String(DEFAULT_TILE_SIZE)} px`;
    gapOutput.textContent = `${String(DEFAULT_GAP_SIZE)} px`;

    syncTileButtons();
    createPaletteOptions();
    syncPaletteOptions();
    regenerateTiles();

    let lastWidth = mosaic.clientWidth;
    let lastHeight = mosaic.clientHeight;

    const observer = new ResizeObserver(() => {
        const width = mosaic.clientWidth;
        const height = mosaic.clientHeight;

        if (width === lastWidth && height === lastHeight) {
            return;
        }

        lastWidth = width;
        lastHeight = height;
        scheduleRegeneration();
    });

    observer.observe(mosaic);

    window.addEventListener(
        'pagehide',
        () => {
            observer.disconnect();
            cancelRegeneration();
        },
        { once: true },
    );

    void initPalettes();
}

initialize();
defineShellElement();
initTheme();
