/*
 * Palette experiment: the static HTML owns the shell and the control layout.
 * Helpers fill the mount points, and a single-worker pool runs ./core in ./worker.ts.
 * Results are appended as fresh elements — no innerHTML, no destructive re-render.
 */

import { WorkerPool } from '../../lib/worker-pool/worker-pool';
import { createSelect, createSlider, createToggle } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';
import { ruleOptions } from './core/rules/registry';
import { isGeneratePaletteResponse } from './types';
import type { GeneratePaletteTask } from './types';

const DEFAULT_TASK: GeneratePaletteTask = { l: 0.7, c: 0.1, h: 196, ruleId: 'triadic' };

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Palette markup is incomplete: ${selector}`);
    }

    return element;
}

const ruleMount = required<HTMLElement>('[data-control="rule"]');
const lightnessMount = required<HTMLElement>('[data-control="lightness"]');
const chromaMount = required<HTMLElement>('[data-control="chroma"]');
const hueMount = required<HTMLElement>('[data-control="hue"]');
const autoMount = required<HTMLElement>('[data-control="auto"]');

const lightnessOutput = required<HTMLOutputElement>('[data-value="lightness"]');
const chromaOutput = required<HTMLOutputElement>('[data-value="chroma"]');
const hueOutput = required<HTMLOutputElement>('[data-value="hue"]');

const baseSwatch = required<HTMLElement>('[data-base-swatch]');
const palettes = required<HTMLElement>('[data-palettes]');
const status = required<HTMLElement>('[data-status]');
const generateButton = required<HTMLButtonElement>('[data-generate]');
const clearButton = required<HTMLButtonElement>('[data-clear]');

const ruleSelect = createSelect(ruleMount, ruleOptions, DEFAULT_TASK.ruleId);
const lightnessSlider = createSlider(lightnessMount, {
    min: 0,
    max: 1,
    step: 0.01,
    value: DEFAULT_TASK.l,
});
const chromaSlider = createSlider(chromaMount, {
    min: 0,
    max: 0.4,
    step: 0.01,
    value: DEFAULT_TASK.c,
});
const hueSlider = createSlider(hueMount, {
    min: 0,
    max: 360,
    step: 1,
    value: DEFAULT_TASK.h,
});
const autoToggle = createToggle(autoMount, true);

const pool = new WorkerPool<GeneratePaletteTask, string[]>({
    maxPoolSize: 1,
    workerFactory: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    serialize: (task) => ({ message: task }),
    deserialize: (event) => {
        const response: unknown = event.data;

        if (!isGeneratePaletteResponse(response)) {
            return { ok: false, error: new Error('Invalid palette response') };
        }

        return response.ok
            ? { ok: true, value: response.colors }
            : { ok: false, error: new Error(response.error) };
    },
});

function currentTask(): GeneratePaletteTask {
    return {
        l: Number(lightnessSlider.value),
        c: Number(chromaSlider.value),
        h: Number(hueSlider.value),
        ruleId: ruleSelect.value,
    };
}

function syncBase(task: GeneratePaletteTask): void {
    lightnessOutput.textContent = task.l.toFixed(2);
    chromaOutput.textContent = task.c.toFixed(2);
    hueOutput.textContent = task.h.toFixed(0);

    const css = `oklch(${task.l} ${task.c} ${task.h})`;

    baseSwatch.style.backgroundColor = css;
    baseSwatch.title = css;
}

function renderPalette(colors: string[]): void {
    const row = document.createElement('div');

    row.className = 'pg-palette__row';

    for (const color of colors) {
        const swatch = document.createElement('div');

        swatch.className = 'pg-palette__swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        row.append(swatch);
    }

    palettes.append(row);
}

function requestPalette(task: GeneratePaletteTask): void {
    status.textContent = 'Génération…';

    // One worker keeps replies in request order: a stale result cannot overwrite a newer one.
    pool.run(task).then(
        (colors) => {
            renderPalette(colors);
            status.textContent = `${colors.length} couleurs générées.`;
        },
        (error: unknown) => {
            status.textContent = `Erreur : ${error instanceof Error ? error.message : String(error)}`;
        },
    );
}

function refresh(auto: boolean): void {
    const task = currentTask();

    syncBase(task);

    if (auto) {
        requestPalette(task);
    }
}

for (const slider of [lightnessSlider, chromaSlider, hueSlider]) {
    slider.addEventListener('input', () => {
        refresh(autoToggle.checked);
    });
}

ruleSelect.addEventListener('change', () => {
    refresh(autoToggle.checked);
});

generateButton.addEventListener('click', () => {
    refresh(true);
});

clearButton.addEventListener('click', () => {
    palettes.replaceChildren();
    status.textContent = 'Palettes effacées.';
});

window.addEventListener('pagehide', () => pool.teardown(), { once: true });

defineShellElement();
initTheme();
refresh(true);
