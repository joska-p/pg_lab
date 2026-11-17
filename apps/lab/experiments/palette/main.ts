/*
 * Palette experiment: the static HTML owns the shell, the state placeholders and
 * the six swatch cards. Helpers fill the mounts, and a single-worker pool runs
 * ./core in ./worker.ts. Generations update those cards in place - no innerHTML,
 * no destructive re-render and no stale result overwriting a newer one.
 */

import { WorkerPool } from '../../lib/worker-pool/worker-pool';
import { createSelect, createSlider, createToggle } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';
import { ruleOptions } from './core/rules/registry';
import { isGeneratePaletteResponse } from './types';
import type { GeneratePaletteTask } from './types';

const DEFAULT_TASK: GeneratePaletteTask = { l: 0.7, c: 0.1, h: 196, ruleId: 'triadic' };

type PaletteState = 'empty' | 'loading' | 'result' | 'error';

function required<T extends Element>(selector: string, parent: ParentNode = document): T {
    const element = parent.querySelector<T>(selector);

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
const baseValue = required<HTMLElement>('[data-base-value]');
const results = required<HTMLElement>('[data-palettes]');
const loading = required<HTMLElement>('[data-loading]');
const swatches = required<HTMLElement>('[data-swatches]');
const emptyState = required<HTMLElement>('[data-empty]');
const errorState = required<HTMLElement>('[data-error]');
const status = required<HTMLElement>('[data-status]');
const generateButton = required<HTMLButtonElement>('[data-generate]');
const clearButton = required<HTMLButtonElement>('[data-clear]');

interface ColorSlot {
    card: HTMLElement;
    label: HTMLElement;
    value: HTMLElement;
    swatch: HTMLElement;
}

const colorSlots: ColorSlot[] = Array.from(
    document.querySelectorAll<HTMLElement>('[data-color-card]'),
    (card) => ({
        card,
        label: required<HTMLElement>('[data-color-label]', card),
        value: required<HTMLElement>('[data-color-value]', card),
        swatch: required<HTMLElement>('[data-color-swatch]', card),
    }),
);

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

let latestRequestId = 0;
let inFlight = 0;

function currentTask(): GeneratePaletteTask {
    return {
        l: Number(lightnessSlider.value),
        c: Number(chromaSlider.value),
        h: Number(hueSlider.value),
        ruleId: ruleSelect.value,
    };
}

function setState(state: PaletteState, message: string): void {
    loading.hidden = state !== 'loading';
    swatches.hidden = state !== 'result';
    emptyState.hidden = state !== 'empty';
    errorState.hidden = state !== 'error';
    results.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');

    if (state === 'error') {
        errorState.textContent = message;
    }

    status.textContent = message;
}

function updateGenerateButton(): void {
    generateButton.disabled = inFlight > 0;
}

function syncBase(task: GeneratePaletteTask): void {
    lightnessOutput.textContent = task.l.toFixed(2);
    chromaOutput.textContent = task.c.toFixed(2);
    hueOutput.textContent = task.h.toFixed(0);

    const css = `oklch(${task.l} ${task.c} ${task.h})`;

    baseSwatch.style.backgroundColor = css;
    baseSwatch.title = css;
    baseSwatch.setAttribute('aria-label', `Couleur de base : ${css}`);
    baseValue.textContent = css;
}

function renderPalette(colors: string[]): void {
    colorSlots.forEach((slot, index) => {
        const color = colors[index];

        if (color === undefined) {
            slot.card.hidden = true;
            return;
        }

        const name = slot.label.textContent ?? `Couleur ${index + 1}`;

        slot.card.hidden = false;
        slot.value.textContent = color;
        slot.swatch.style.backgroundColor = color;
        slot.swatch.title = color;
        slot.swatch.setAttribute('aria-label', `${name} : ${color}`);
    });

    setState('result', `${colors.length} couleurs générées.`);
}

function requestPalette(task: GeneratePaletteTask): void {
    const requestId = ++latestRequestId;

    inFlight += 1;
    updateGenerateButton();
    setState('loading', 'Génération…');

    pool.run(task)
        .then(
            (colors) => {
                if (requestId !== latestRequestId) {
                    return;
                }

                renderPalette(colors);
            },
            (error: unknown) => {
                if (requestId !== latestRequestId) {
                    return;
                }

                const message = error instanceof Error ? error.message : String(error);

                setState('error', `Erreur : ${message}`);
            },
        )
        .finally(() => {
            inFlight -= 1;
            updateGenerateButton();
        });
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
    // Invalidate any in-flight generation so Effacer always ends on the empty state.
    latestRequestId += 1;
    setState('empty', 'Palettes effacées.');
});

window.addEventListener('pagehide', () => pool.teardown(), { once: true });

defineShellElement();
initTheme();
refresh(true);
