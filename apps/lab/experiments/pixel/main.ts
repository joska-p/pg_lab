/*
 * Pixel docs static port. The documentation copy lives in index.html; this
 * module only builds the sidebar, fills the manipulation view from the shared
 * catalog metadata and runs the three off-thread demos through the shared pool.
 */

import type {
    ArgDefinition,
    ManipulationInfo,
    Step,
} from '../../lib/pixel-core/worker/process-image-in-worker';
import {
    createPixelPool,
    getManipulations,
} from '../../lib/pixel-core/worker/process-image-in-worker';
import { createSlider } from '../../ui/controls';
import { createSampleImageData, imageDataToUrl } from '../../ui/image-data';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';

type PipelineId = 'resize' | 'chaining';

type Endpoint =
    | { kind: 'overview' }
    | { kind: 'manip'; id: string }
    | { kind: 'pipeline'; id: PipelineId }
    | { kind: 'internals'; id: string };

interface NavItem {
    endpoint: Endpoint;
    label: string;
}

interface ResizeMode {
    label: string;
    options: Record<string, string | number>;
}

const INTERNALS: readonly NavItem[] = [
    { endpoint: { kind: 'internals', id: 'execution-engine' }, label: 'Execution engine' },
    { endpoint: { kind: 'internals', id: 'fusion-scheduler' }, label: 'Fusion scheduler' },
    { endpoint: { kind: 'internals', id: 'tiling' }, label: 'Tiling' },
    { endpoint: { kind: 'internals', id: 'resize-algorithm' }, label: 'Resize algorithm' },
    { endpoint: { kind: 'internals', id: 'worker-architecture' }, label: 'Worker architecture' },
    { endpoint: { kind: 'internals', id: 'configuration' }, label: 'Configuration' },
];

const RESIZE_MODES: readonly ResizeMode[] = [
    { label: 'Width', options: { width: 100 } },
    { label: 'Height', options: { height: 100 } },
    { label: 'Fill', options: { width: 100, height: 100, fit: 'fill' } },
    { label: 'Contain', options: { width: 100, height: 100, fit: 'contain' } },
    { label: 'Cover', options: { width: 100, height: 100, fit: 'cover' } },
];

const CHAIN_STEPS: readonly { id: string; options: Record<string, number> }[] = [
    { id: 'brightness', options: { value: 1.2 } },
    { id: 'contrast', options: { value: 1.3 } },
    { id: 'sharpen', options: { strength: 1.5 } },
];

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Pixel docs markup is incomplete: ${selector}`);
    }

    return element;
}

const catalog = getManipulations();
const pool = createPixelPool();
const status = required<HTMLElement>('[data-status]');
const errorBox = required<HTMLElement>('[data-error]');
const nav = required<HTMLElement>('[data-nav]');
const demoSource = required<HTMLImageElement>('[data-demo-source]');
const manipBadge = required<HTMLElement>('[data-manip-badge]');
const manipPath = required<HTMLElement>('[data-manip-path]');
const manipTitle = required<HTMLElement>('[data-manip-title]');
const manipDescription = required<HTMLElement>('[data-manip-description]');
const manipLong = required<HTMLElement>('[data-manip-long]');
const manipParams = required<HTMLElement>('[data-manip-params]');
const manipParamsCard = required<HTMLElement>('[data-manip-params-card]');
const manipControls = required<HTMLElement>('[data-manip-controls]');
const manipResult = required<HTMLImageElement>('[data-manip-result]');
const manipDimensions = required<HTMLElement>('[data-manip-dimensions]');
const manipCode = required<HTMLElement>('[data-manip-code]');
const resizeModes = required<HTMLElement>('[data-resize-modes]');
const resizeResult = required<HTMLImageElement>('[data-resize-result]');
const resizeDimensions = required<HTMLElement>('[data-resize-dimensions]');
const chainGrid = required<HTMLElement>('[data-chain-grid]');

const listeners = new AbortController();
const paramValues: Record<string, Record<string, number>> = {};

let source: ImageData | null = null;
let activeEndpoint: Endpoint = { kind: 'overview' };
let activeManipulation: string | null = null;
let selectedResizeMode = 0;
let runGeneration = 0;
let tornDown = false;

function setStatus(message: string): void {
    status.textContent = message;
}

function setError(message: string | null): void {
    errorBox.textContent = message ?? '';
    errorBox.hidden = message === null;
}

function isStep(value: unknown): value is Step {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'string' &&
        Object.hasOwn(catalog, value.id)
    );
}

function toSteps(candidates: readonly unknown[]): Step[] {
    return candidates.filter((candidate): candidate is Step => isStep(candidate));
}

function showResult(
    image: HTMLImageElement,
    label: HTMLElement,
    data: ImageData | undefined,
): void {
    if (!data) {
        return;
    }

    image.src = imageDataToUrl(data) ?? '';
    label.textContent = `${String(data.width)} × ${String(data.height)}`;
}

function optionValue(info: ManipulationInfo, definition: ArgDefinition): number {
    const stored = activeManipulation
        ? paramValues[activeManipulation]?.[definition.key]
        : undefined;

    return stored ?? info.defaultArgs[definition.key] ?? definition.min;
}

function updateCodeSample(id: string): void {
    const info = catalog[id];

    if (!info) {
        return;
    }

    const entries = info.argDefinitions.map(
        (definition) => `${definition.key}: ${String(optionValue(info, definition))}`,
    );
    const options = entries.length > 0 ? `, options: { ${entries.join(', ')} }` : '';

    manipCode.textContent = `pixel.run({\n  sourceImageData: source,\n  steps: [\n    { id: '${id}'${options} },\n  ],\n});`;
}

function endpointKey(endpoint: Endpoint): string {
    if (endpoint.kind === 'overview') {
        return 'overview';
    }

    return `${endpoint.kind}:${endpoint.id}`;
}

function selectView(endpoint: Endpoint): void {
    let selector: string;

    if (endpoint.kind === 'overview') {
        selector = '[data-view="overview"]';
    } else if (endpoint.kind === 'manip') {
        selector = '[data-view="manip"]';
    } else if (endpoint.kind === 'pipeline') {
        selector = `[data-view="pipeline"][data-pipeline="${endpoint.id}"]`;
    } else {
        selector = `[data-view="internals"][data-internals="${endpoint.id}"]`;
    }

    for (const section of document.querySelectorAll<HTMLElement>('[data-view]')) {
        section.hidden = !section.matches(selector);
    }

    const key = endpointKey(endpoint);

    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-endpoint]')) {
        button.setAttribute('aria-current', String(button.dataset.endpoint === key));
    }
}

function renderChainGrid(): void {
    const figures = ['Source', 'brightness', 'contrast', 'sharpen'].map((label) => {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        image.alt = label;
        const caption = document.createElement('figcaption');
        caption.textContent = label;
        figure.append(image, caption);
        return figure;
    });

    chainGrid.replaceChildren(...figures);
}

function setChainResults(results: ImageData[]): void {
    const figures = chainGrid.querySelectorAll('figure');
    const first = figures[0];

    if (first && source) {
        const image = first.querySelector('img');

        if (image) {
            image.src = imageDataToUrl(source) ?? '';
        }
    }

    for (let index = 0; index < results.length; index++) {
        const figure = figures[index + 1];
        const data = results[index];

        if (!figure || !data) {
            continue;
        }

        const image = figure.querySelector('img');

        if (image) {
            image.src = imageDataToUrl(data) ?? '';
        }
    }
}

async function runManipulation(id: string): Promise<void> {
    const info = catalog[id];

    if (!source || !info) {
        return;
    }

    const options: Record<string, number> = {};

    for (const definition of info.argDefinitions) {
        options[definition.key] = optionValue(info, definition);
    }

    const generation = ++runGeneration;

    setStatus('Traitement…');
    setError(null);

    try {
        const results = await pool.run({
            sourceImageData: source,
            steps: toSteps([{ id, options }]),
        });

        if (
            tornDown ||
            generation !== runGeneration ||
            activeEndpoint.kind !== 'manip' ||
            activeEndpoint.id !== id
        ) {
            return;
        }

        showResult(manipResult, manipDimensions, results[0]);
        setStatus('Aperçu mis à jour.');
    } catch (cause) {
        if (!tornDown && generation === runGeneration) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setStatus('Échec du traitement.');
        }
    }
}

async function runResize(): Promise<void> {
    const mode = RESIZE_MODES[selectedResizeMode];

    if (!source || !mode) {
        return;
    }

    const generation = ++runGeneration;

    setStatus('Redimensionnement…');
    setError(null);

    try {
        const results = await pool.run({
            sourceImageData: source,
            steps: toSteps([{ id: 'resize', options: mode.options }]),
        });

        if (tornDown || generation !== runGeneration) {
            return;
        }

        showResult(resizeResult, resizeDimensions, results[0]);
        setStatus('Redimensionnement terminé.');
    } catch (cause) {
        if (!tornDown && generation === runGeneration) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setStatus('Échec du redimensionnement.');
        }
    }
}

async function runChain(): Promise<void> {
    if (!source) {
        return;
    }

    const generation = ++runGeneration;

    setStatus('Chaînage…');
    setError(null);

    try {
        const results = await pool.run({
            sourceImageData: source,
            steps: toSteps(CHAIN_STEPS),
        });

        if (tornDown || generation !== runGeneration) {
            return;
        }

        setChainResults(results);
        setStatus('Chaînage terminé.');
    } catch (cause) {
        if (!tornDown && generation === runGeneration) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setStatus('Échec du chaînage.');
        }
    }
}

function renderManipulation(id: string): void {
    const info = catalog[id];

    if (!info) {
        return;
    }

    activeManipulation = id;
    manipBadge.textContent =
        info.access === 'neighborhood' ? 'NEIGHBOR' : info.access.toUpperCase();
    manipPath.textContent = `/manip/${id}`;
    manipTitle.textContent = info.name;
    manipDescription.textContent = info.description;
    manipLong.textContent = info.longDescription;

    const rows = info.argDefinitions.map((definition) => {
        const row = document.createElement('tr');
        const cells = [
            definition.key,
            'number',
            String(info.defaultArgs[definition.key] ?? definition.min),
            definition.label,
        ];

        for (const text of cells) {
            const cell = document.createElement('td');
            cell.textContent = text;
            row.append(cell);
        }

        return row;
    });

    manipParams.replaceChildren(...rows);
    manipParamsCard.hidden = rows.length === 0;

    const controls: HTMLElement[] = [];

    for (const definition of info.argDefinitions) {
        const label = document.createElement('label');
        label.className = 'pg-control';
        const name = document.createElement('span');
        name.textContent = definition.label;
        const mount = document.createElement('span');
        const output = document.createElement('output');
        const value = optionValue(info, definition);
        const slider = createSlider(mount, {
            min: definition.min,
            max: definition.max,
            step: definition.step,
            value,
        });

        output.textContent = String(value);
        slider.addEventListener(
            'input',
            () => {
                output.textContent = slider.value;
            },
            { signal: listeners.signal },
        );
        slider.addEventListener(
            'change',
            () => {
                const values = (paramValues[id] ??= {});

                values[definition.key] = Number(slider.value);
                updateCodeSample(id);
                void runManipulation(id);
            },
            { signal: listeners.signal },
        );

        label.append(name, mount, output);
        controls.push(label);
    }

    manipControls.replaceChildren(...controls);
    updateCodeSample(id);
}

function renderResizeModes(): void {
    const buttons = RESIZE_MODES.map((mode, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = mode.label;
        button.setAttribute('aria-pressed', String(index === selectedResizeMode));
        button.addEventListener(
            'click',
            () => {
                selectedResizeMode = index;
                renderResizeModes();
                void runResize();
            },
            { signal: listeners.signal },
        );

        return button;
    });

    resizeModes.replaceChildren(...buttons);
}

function setEndpoint(endpoint: Endpoint): void {
    activeEndpoint = endpoint;
    selectView(endpoint);
    setError(null);

    if (endpoint.kind === 'manip') {
        renderManipulation(endpoint.id);
        void runManipulation(endpoint.id);
    } else if (endpoint.kind === 'pipeline' && endpoint.id === 'resize') {
        void runResize();
    } else if (endpoint.kind === 'pipeline' && endpoint.id === 'chaining') {
        void runChain();
    } else {
        setStatus('Documentation prête.');
    }
}

function buildNavigation(): void {
    const byAccess = (access: ManipulationInfo['access']): NavItem[] =>
        Object.values(catalog)
            .filter((info) => info.access === access)
            .map((info) => ({ endpoint: { kind: 'manip', id: info.id }, label: info.name }));

    const groups: { label: string; items: readonly NavItem[] }[] = [
        { label: 'OVERVIEW', items: [{ endpoint: { kind: 'overview' }, label: 'Overview' }] },
        { label: 'PIXEL', items: byAccess('pixel') },
        { label: 'NEIGHBOR', items: byAccess('neighborhood') },
        { label: 'GLOBAL', items: byAccess('global') },
        {
            label: 'PIPELINE',
            items: [
                { endpoint: { kind: 'pipeline', id: 'resize' }, label: 'Resize' },
                { endpoint: { kind: 'pipeline', id: 'chaining' }, label: 'Chaining' },
            ],
        },
        { label: 'INTERNALS', items: INTERNALS },
    ];

    const sections = groups.map((group) => {
        const section = document.createElement('div');
        section.className = 'pg-pixel__nav-group';
        const header = document.createElement('button');
        header.type = 'button';
        header.textContent = group.label;
        header.setAttribute('aria-expanded', 'true');

        const items = document.createElement('div');
        items.className = 'pg-pixel__nav-items';

        for (const item of group.items) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = item.label;
            button.dataset.endpoint = endpointKey(item.endpoint);
            button.addEventListener(
                'click',
                () => {
                    setEndpoint(item.endpoint);
                },
                { signal: listeners.signal },
            );
            items.append(button);
        }

        header.addEventListener(
            'click',
            () => {
                const expanded = header.getAttribute('aria-expanded') === 'true';

                header.setAttribute('aria-expanded', String(!expanded));
                items.hidden = expanded;
            },
            { signal: listeners.signal },
        );

        section.append(header, items);
        return section;
    });

    nav.replaceChildren(...sections);
}

try {
    source = createSampleImageData();
    demoSource.src = imageDataToUrl(source) ?? '';
} catch (cause) {
    setError(cause instanceof Error ? cause.message : String(cause));
}

buildNavigation();
renderResizeModes();
renderChainGrid();
setEndpoint({ kind: 'overview' });

window.addEventListener(
    'pagehide',
    () => {
        tornDown = true;
        listeners.abort();
        pool.teardown();
    },
    { once: true },
);

defineShellElement();
initTheme();
