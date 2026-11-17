/*
 * The two former state stores collapse into two module-level values.
 * Actions are the only writers and announce a narrow topic so the page can
 * repaint immediately for data changes and coalesce viewport changes.
 */

import { getLayer } from './core/layers/registry';
import type { CanvasViewport, LayerConfigEntry } from './core/types';
import { generateSequence } from './engine/engine';
import { recamanRule } from './engine/rules/recaman';
import type { SequenceRule } from './engine/rules/types';

export type StateTopic = 'sequence' | 'layers' | 'viewport';

export interface SequenceState {
    sequenceRule: SequenceRule;
    steps: number;
    seed: string;
    sequence: number[];
}

interface UiState {
    layers: LayerConfigEntry[];
    viewport: CanvasViewport;
}

type Listener = (topic: StateTopic) => void;

const listeners = new Set<Listener>();

function createDefaultLayers(): LayerConfigEntry[] {
    return [
        { id: 'baseline', enabled: true, params: {} },
        { id: 'plotted-numbers', enabled: true, params: {} },
        { id: 'recaman-arcs', enabled: true, params: {} },
    ];
}

const sequenceState: SequenceState = {
    sequenceRule: recamanRule,
    steps: 2,
    seed: 'random seed',
    sequence: generateSequence({ sequenceRule: recamanRule, steps: 2 }),
};

const uiState: UiState = {
    layers: createDefaultLayers(),
    viewport: { enabled: false, zoom: 1, panX: 0, panY: 0 },
};

function notify(topic: StateTopic): void {
    for (const listener of listeners) {
        listener(topic);
    }
}

function subscribe(listener: Listener): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function clampSteps(steps: number, maxSteps: number): number {
    return Math.min(Math.max(steps, 2), maxSteps);
}

function regenerateSequence(rule: SequenceRule, steps: number, seed?: string): number[] {
    return generateSequence({
        sequenceRule: rule,
        steps,
        ...(seed ? { seed } : {}),
    });
}

function setSequenceRule(rule: SequenceRule): void {
    const steps = clampSteps(sequenceState.steps, rule.maxSteps);

    sequenceState.sequenceRule = rule;
    sequenceState.steps = steps;
    sequenceState.sequence = regenerateSequence(rule, steps, sequenceState.seed);
    notify('sequence');
}

function setSequenceSteps(steps: number): void {
    const clamped = clampSteps(steps, sequenceState.sequenceRule.maxSteps);

    sequenceState.steps = clamped;
    sequenceState.sequence = regenerateSequence(
        sequenceState.sequenceRule,
        clamped,
        sequenceState.seed,
    );
    notify('sequence');
}

function setSeed(seed: string): void {
    sequenceState.seed = seed;
    sequenceState.sequence = regenerateSequence(
        sequenceState.sequenceRule,
        sequenceState.steps,
        seed,
    );
    notify('sequence');
}

function toggleLayer(id: string): void {
    uiState.layers = uiState.layers.map((entry) =>
        entry.id === id ? { ...entry, enabled: !entry.enabled } : entry,
    );
    notify('layers');
}

function addLayer(id: string): void {
    const layer = getLayer(id);

    if (!layer) {
        return;
    }

    const defaults: Record<string, unknown> = {};

    for (const key of Object.keys(layer.params)) {
        const descriptor = layer.params[key];

        if (descriptor) {
            defaults[key] = descriptor.default;
        }
    }

    uiState.layers = [...uiState.layers, { id, enabled: true, params: defaults }];
    notify('layers');
}

function removeLayer(id: string): void {
    uiState.layers = uiState.layers.filter((entry) => entry.id !== id);
    notify('layers');
}

function setViewport(patch: Partial<CanvasViewport>): void {
    uiState.viewport = { ...uiState.viewport, ...patch };
    notify('viewport');
}

function resetViewport(): void {
    uiState.viewport = { enabled: false, zoom: 1, panX: 0, panY: 0 };
    notify('viewport');
}

function updateLayerParams(id: string, patch: Record<string, unknown>): void {
    uiState.layers = uiState.layers.map((entry) =>
        entry.id === id ? { ...entry, params: { ...entry.params, ...patch } } : entry,
    );
    notify('layers');
}

export {
    addLayer,
    removeLayer,
    resetViewport,
    sequenceState,
    setSeed,
    setSequenceRule,
    setSequenceSteps,
    setViewport,
    subscribe,
    toggleLayer,
    uiState,
    updateLayerParams,
};
