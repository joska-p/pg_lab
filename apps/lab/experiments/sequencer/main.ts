/*
 * Sequencer static port: the shell, the canvas and every section live in the
 * HTML. This module only creates the native controls once and patches values,
 * visibility and text as the two module-level states change.
 */

import { createSelect, createSlider, createTextInput, createToggle } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';
import { createSequencerCanvas } from './canvas';
import type { SequencerCanvas } from './canvas';
import { getAllLayers, getLayer } from './core/layers/registry';
import { allRules } from './engine/rules/registry';
import type { SequenceRule } from './engine/rules/types';
import { register as registerFourier } from './fourier';
import { setFourierRedraw } from './fourier/store';
import {
    addLayer,
    removeLayer,
    resetViewport,
    sequenceState,
    setSeed,
    setSequenceRule,
    setSequenceSteps,
    subscribe,
    toggleLayer,
    uiState,
    updateLayerParams,
} from './state';

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Sequencer markup is incomplete: ${selector}`);
    }

    return element;
}

function readNumber(raw: unknown, fallback: number): number {
    return typeof raw === 'number' ? raw : fallback;
}

function readBoolean(raw: unknown, fallback: boolean): boolean {
    return typeof raw === 'boolean' ? raw : fallback;
}

function readString(raw: unknown, fallback: string): string {
    return typeof raw === 'string' ? raw : fallback;
}

function findRule(id: string): SequenceRule | undefined {
    return allRules.find((rule) => rule.id === id);
}

const canvas = required<HTMLCanvasElement>('[data-canvas]');
const status = required<HTMLElement>('[data-status]');
const stepsOutput = required<HTMLOutputElement>('[data-value="steps"]');
const zoomOutput = required<HTMLOutputElement>('[data-zoom]');
const layerList = required<HTMLElement>('[data-layer-list]');
const layerOptions = required<HTMLElement>('[data-layer-options]');
const addLayerList = required<HTMLElement>('[data-add-layer-list]');

const listeners = new AbortController();
let controller: SequencerCanvas | null = null;
let expandedLayerId: string | null = null;
let showAddMenu = false;

function updateStatus(): void {
    const active = uiState.layers.filter((entry) => entry.enabled).length;
    status.textContent = `${String(sequenceState.sequence.length)} valeurs · ${String(active)} couches actives`;
}

function updateZoom(): void {
    const viewport = uiState.viewport;
    zoomOutput.textContent = `${String(Math.round(viewport.zoom * 100))} %`;
}

function syncSequenceControls(select: HTMLSelectElement, stepsSlider: HTMLInputElement): void {
    select.value = sequenceState.sequenceRule.id;
    stepsSlider.max = String(sequenceState.sequenceRule.maxSteps);
    stepsSlider.value = String(sequenceState.steps);
    stepsOutput.textContent = String(sequenceState.steps);
}

function renderLayerOptions(): void {
    const entry = uiState.layers.find((item) => item.id === expandedLayerId);
    const layer = entry ? getLayer(entry.id) : undefined;

    if (!entry || !layer) {
        expandedLayerId = null;
        layerOptions.replaceChildren();
        layerOptions.hidden = true;
        return;
    }

    const nodes: HTMLElement[] = [];
    const title = document.createElement('h4');
    title.textContent = layer.name;
    nodes.push(title);

    for (const [key, descriptor] of Object.entries(layer.params)) {
        const label = document.createElement('label');
        label.className = 'pg-control';
        const name = document.createElement('span');
        name.textContent = descriptor.label;
        const mount = document.createElement('span');
        const output = document.createElement('output');
        const raw = entry.params[key];

        switch (descriptor.type) {
            case 'number': {
                const value = readNumber(raw, descriptor.default);
                const slider = createSlider(mount, {
                    min: descriptor.min,
                    max: descriptor.max,
                    step: descriptor.step,
                    value,
                });
                output.textContent = String(value);
                slider.addEventListener(
                    'input',
                    () => {
                        const next = Number(slider.value);
                        output.textContent = String(next);
                        updateLayerParams(entry.id, { [key]: next });
                    },
                    { signal: listeners.signal },
                );
                break;
            }
            case 'boolean': {
                const toggle = createToggle(mount, readBoolean(raw, descriptor.default));
                toggle.addEventListener(
                    'change',
                    () => {
                        updateLayerParams(entry.id, { [key]: toggle.checked });
                    },
                    { signal: listeners.signal },
                );
                break;
            }
            case 'color': {
                const picker = document.createElement('input');
                picker.type = 'color';
                picker.value = readString(raw, descriptor.default) || '#ffffff';
                picker.addEventListener(
                    'input',
                    () => {
                        updateLayerParams(entry.id, { [key]: picker.value });
                    },
                    { signal: listeners.signal },
                );
                break;
            }
            case 'string': {
                const input = createTextInput(mount, readString(raw, descriptor.default));
                input.addEventListener(
                    'input',
                    () => {
                        updateLayerParams(entry.id, { [key]: input.value });
                    },
                    { signal: listeners.signal },
                );
                break;
            }
        }

        if (descriptor.type === 'number') {
            label.append(name, mount, output);
        } else {
            label.append(name, mount);
        }

        nodes.push(label);
    }

    layerOptions.replaceChildren(...nodes);
    layerOptions.hidden = false;
}

function renderLayerList(): void {
    const rows: HTMLElement[] = [];

    for (const entry of uiState.layers) {
        const layer = getLayer(entry.id);

        if (!layer) {
            continue;
        }

        const row = document.createElement('div');
        row.className = 'pg-sequencer__layer-row';

        const toggleLabel = document.createElement('label');
        const toggle = createToggle(toggleLabel, entry.enabled);
        toggle.setAttribute('aria-label', `Activer ${layer.name}`);
        const name = document.createElement('span');
        name.textContent = layer.name;
        toggleLabel.append(name);
        toggle.addEventListener(
            'change',
            () => {
                toggleLayer(entry.id);
            },
            { signal: listeners.signal },
        );

        const optionsButton = document.createElement('button');
        optionsButton.type = 'button';
        optionsButton.textContent = '⋯';
        optionsButton.setAttribute('aria-label', `Options de ${layer.name}`);
        optionsButton.setAttribute('aria-expanded', String(expandedLayerId === entry.id));
        optionsButton.addEventListener(
            'click',
            () => {
                expandedLayerId = expandedLayerId === entry.id ? null : entry.id;
                renderLayerList();
                renderLayerOptions();
            },
            { signal: listeners.signal },
        );

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = '×';
        removeButton.setAttribute('aria-label', `Retirer ${layer.name}`);
        removeButton.addEventListener(
            'click',
            () => {
                if (expandedLayerId === entry.id) {
                    expandedLayerId = null;
                }
                removeLayer(entry.id);
                renderLayerList();
                renderLayerOptions();
            },
            { signal: listeners.signal },
        );

        row.append(toggleLabel, optionsButton, removeButton);
        rows.push(row);
    }

    layerList.replaceChildren(...rows);
}

function renderAddMenu(): void {
    const configured = new Set(uiState.layers.map((entry) => entry.id));
    const buttons: HTMLButtonElement[] = [];

    for (const layer of getAllLayers()) {
        if (configured.has(layer.id)) {
            continue;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = layer.name;
        button.addEventListener(
            'click',
            () => {
                addLayer(layer.id);
                expandedLayerId = layer.id;
                showAddMenu = false;
                renderAddMenu();
                renderLayerList();
                renderLayerOptions();
            },
            { signal: listeners.signal },
        );
        buttons.push(button);
    }

    addLayerList.replaceChildren(...buttons);
    addLayerList.hidden = !showAddMenu;
}

function createControls(): {
    select: HTMLSelectElement;
    stepsSlider: HTMLInputElement;
    seedInput: HTMLInputElement;
} {
    const select = createSelect(
        required<HTMLElement>('[data-control="rule"]'),
        allRules.map((rule) => ({ value: rule.id, label: rule.name })),
        sequenceState.sequenceRule.id,
    );
    const stepsSlider = createSlider(required<HTMLElement>('[data-control="steps"]'), {
        min: 1,
        max: sequenceState.sequenceRule.maxSteps,
        step: 1,
        value: sequenceState.steps,
    });
    const seedInput = createTextInput(
        required<HTMLElement>('[data-control="seed"]'),
        sequenceState.seed,
    );

    select.addEventListener(
        'change',
        () => {
            const rule = findRule(select.value);

            if (rule) {
                setSequenceRule(rule);
            }
        },
        { signal: listeners.signal },
    );
    stepsSlider.addEventListener(
        'input',
        () => {
            setSequenceSteps(Number(stepsSlider.value));
        },
        { signal: listeners.signal },
    );
    seedInput.addEventListener(
        'input',
        () => {
            setSeed(seedInput.value);
        },
        { signal: listeners.signal },
    );

    return { select, stepsSlider, seedInput };
}

// Rule registration is explicit, so the option list is complete before the select is built.
registerFourier();

const { select, stepsSlider } = createControls();

subscribe((topic) => {
    if (topic === 'sequence') {
        syncSequenceControls(select, stepsSlider);
        updateStatus();
    } else if (topic === 'layers') {
        renderLayerList();
        updateStatus();
    } else {
        updateZoom();
    }
});

required<HTMLButtonElement>('[data-reset-viewport]').addEventListener(
    'click',
    () => {
        resetViewport();
    },
    { signal: listeners.signal },
);
required<HTMLButtonElement>('[data-add-layer]').addEventListener(
    'click',
    () => {
        showAddMenu = !showAddMenu;
        renderAddMenu();
    },
    { signal: listeners.signal },
);

controller = createSequencerCanvas(canvas, listeners.signal);
setFourierRedraw(() => {
    controller?.requestPaint();
});

renderLayerList();
renderAddMenu();
renderLayerOptions();
updateStatus();
updateZoom();

// initTheme registers its click handler first: ours repaints after the theme changed.
required<HTMLButtonElement>('[data-theme-toggle]').addEventListener(
    'click',
    () => {
        controller?.requestPaint();
    },
    { signal: listeners.signal },
);

window.addEventListener(
    'pagehide',
    () => {
        listeners.abort();
        controller?.destroy();
        controller = null;
    },
    { once: true },
);

defineShellElement();
initTheme();
