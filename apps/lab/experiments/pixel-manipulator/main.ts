import './styles.css';
import { createSelect, createSlider } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';
import type { Step } from './core/processor/manipulations/manifest';
import type { ArgDefinition } from './core/processor/types';
import { createPipelinePool, getManipulations } from './core/worker/process-image-in-worker';
import { WORKFLOW_PRESETS } from './presets';

const MAX_STEPS = 8;

interface WorkflowStep {
    uid: string;
    id: string;
    options: Record<string, unknown>;
}

type ViewMode = 'grid' | 'compare';

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Pixel Manipulator markup is incomplete: ${selector}`);
    }

    return element;
}

const manipulationCatalog = getManipulations();
const manipulationIds = Object.keys(manipulationCatalog);

const emptyState = required<HTMLElement>('[data-empty]');
const toolbar = required<HTMLElement>('[data-toolbar]');
const comparePick = required<HTMLElement>('[data-compare-pick]');
const grid = required<HTMLUListElement>('[data-grid]');
const compareView = required<HTMLElement>('[data-compare-view]');
const overlay = required<HTMLElement>('[data-overlay]');
const statusLine = required<HTMLElement>('[data-status]');
const errorBox = required<HTMLElement>('[data-error]');

const dropzone = required<HTMLElement>('[data-dropzone]');
const dropzoneLabel = required<HTMLElement>('[data-dropzone-label]');
const uploadInput = required<HTMLInputElement>('[data-upload-input]');
const sourceInfo = required<HTMLElement>('[data-source-info]');
const sourceName = required<HTMLElement>('[data-source-name]');
const sourceSize = required<HTMLElement>('[data-source-size]');

const presetsMount = required<HTMLElement>('[data-presets]');
const workflowMount = required<HTMLElement>('[data-workflow]');
const stepCount = required<HTMLElement>('[data-step-count]');
const addStepButton = required<HTMLButtonElement>('[data-add-step]');
const executeButton = required<HTMLButtonElement>('[data-execute]');
const clearWorkflowButton = required<HTMLButtonElement>('[data-clear-workflow]');
const clearOutputsButton = required<HTMLButtonElement>('[data-clear-outputs]');
const clearSourceButton = required<HTMLButtonElement>('[data-clear-source]');

const sourceCanvas = required<HTMLCanvasElement>('[data-canvas="source"]');
const compareCanvas = required<HTMLCanvasElement>('[data-canvas="compare"]');
const decodeCanvas = required<HTMLCanvasElement>('[data-canvas="decode"]');
const sourceDimension = required<HTMLElement>('[data-dimension="source"]');

const outputCards = Array.from({ length: MAX_STEPS }, (_, index) =>
    required<HTMLElement>(`[data-output="${index}"]`),
);
const outputCanvases = Array.from({ length: MAX_STEPS }, (_, index) =>
    required<HTMLCanvasElement>(`[data-canvas="output-${index}"]`),
);
const outputTitles = Array.from({ length: MAX_STEPS }, (_, index) =>
    required<HTMLElement>(`[data-output-title="${index}"]`),
);
const outputDimensions = Array.from({ length: MAX_STEPS }, (_, index) =>
    required<HTMLElement>(`[data-dimension="output-${index}"]`),
);
const downloadButtons = Array.from({ length: MAX_STEPS }, (_, index) =>
    required<HTMLButtonElement>(`[data-download="${index}"]`),
);
const viewTabs = [...document.querySelectorAll<HTMLButtonElement>('[data-view]')];

const manipulationSelect = createSelect(
    required<HTMLElement>('[data-control="manipulation"]'),
    manipulationIds.map((id) => ({ value: id, label: manipulationCatalog[id]?.name ?? id })),
    manipulationIds[0] ?? '',
);
const compareSelect = createSelect(
    required<HTMLElement>('[data-control="compare-step"]'),
    Array.from({ length: MAX_STEPS }, (_, index) => ({
        value: String(index),
        label: `Step ${String(index + 1)}`,
    })),
    '0',
);

/* The page owns the worker URL so Vite emits and hashes the module worker chunk. */
const pool = createPipelinePool(
    () =>
        new Worker(new URL('./core/worker/pipeline-worker.ts', import.meta.url), {
            type: 'module',
        }),
);
const listeners = new AbortController();

let sourceImageData: ImageData | null = null;
let outputs: ImageData[] = [];
let workflow: WorkflowStep[] = [];
let view: ViewMode = 'grid';
let selectedOutput = 0;
let comparePosition = 50;
let isDraggingCompare = false;
let dragDepth = 0;
let processing = false;
let tornDown = false;
let runGeneration = 0;

function setStatus(text: string): void {
    statusLine.textContent = text;
}

function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? '';
}

function errorMessage(cause: unknown): string {
    return cause instanceof Error ? cause.message : String(cause);
}

function formatValue(value: number, step: number): string {
    return value.toFixed(step >= 1 ? 0 : 2);
}

function numberOption(options: Record<string, unknown>, key: string, fallback: number): number {
    const value = options[key];

    return typeof value === 'number' ? value : fallback;
}

function paint(canvas: HTMLCanvasElement, data: ImageData): void {
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas 2D context unavailable');
    }

    if (canvas.width !== data.width) {
        canvas.width = data.width;
    }
    if (canvas.height !== data.height) {
        canvas.height = data.height;
    }

    context.putImageData(data, 0, 0);
}

function clearCanvas(canvas: HTMLCanvasElement): void {
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
}

function syncButtons(): void {
    executeButton.disabled = processing || sourceImageData === null || workflow.length === 0;
    clearWorkflowButton.disabled = workflow.length === 0;
    addStepButton.disabled = processing || manipulationIds.length === 0;
}

function setProcessing(value: boolean): void {
    processing = value;
    overlay.hidden = !value;
    syncButtons();
}

function renderOutputs(): void {
    for (let index = 0; index < MAX_STEPS; index++) {
        const card = outputCards[index];
        const canvas = outputCanvases[index];
        const title = outputTitles[index];
        const dimension = outputDimensions[index];
        const download = downloadButtons[index];

        if (!card || !canvas || !title || !dimension || !download) {
            continue;
        }

        const result = outputs[index];

        card.hidden = result === undefined;
        card.dataset.selected = String(view === 'compare' && index === selectedOutput);
        download.disabled = result === undefined;

        if (result) {
            paint(canvas, result);
            title.textContent = `${String(index + 1)}. Step ${String(index + 1)}`;
            dimension.textContent = `${result.width}×${result.height}`;
        } else {
            clearCanvas(canvas);
            title.textContent = '';
            dimension.textContent = '';
        }
    }

    for (const option of compareSelect.options) {
        option.hidden = Number(option.value) >= outputs.length;
    }

    if (selectedOutput >= outputs.length) {
        selectedOutput = 0;
    }
    compareSelect.value = String(selectedOutput);
}

function renderCompare(): void {
    if (view !== 'compare' || !sourceImageData) {
        return;
    }

    const result = outputs[selectedOutput];
    const resultCanvas = outputCanvases[selectedOutput];
    const context = compareCanvas.getContext('2d');

    if (!result || !resultCanvas || !context) {
        return;
    }

    const { width, height } = sourceImageData;

    if (compareCanvas.width !== width) {
        compareCanvas.width = width;
    }
    if (compareCanvas.height !== height) {
        compareCanvas.height = height;
    }

    const sliderX = (comparePosition / 100) * width;

    context.clearRect(0, 0, width, height);
    context.drawImage(resultCanvas, 0, 0);
    context.save();
    context.beginPath();
    context.rect(0, 0, sliderX, height);
    context.clip();
    context.drawImage(sourceCanvas, 0, 0);
    context.restore();

    context.beginPath();
    context.moveTo(sliderX, 0);
    context.lineTo(sliderX, height);
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;
    context.stroke();

    context.beginPath();
    context.arc(sliderX, height / 2, 10, 0, Math.PI * 2);
    context.fillStyle = '#ffffff';
    context.fill();
    context.strokeStyle = '#1d2021';
    context.lineWidth = 2;
    context.stroke();
}

function syncView(): void {
    const hasCompare = sourceImageData !== null && outputs.length > 0;

    emptyState.hidden = sourceImageData !== null;
    toolbar.hidden = !hasCompare;
    comparePick.hidden = view !== 'compare';
    compareView.hidden = !(hasCompare && view === 'compare');
    grid.hidden = sourceImageData === null || (hasCompare && view === 'compare');

    for (const tab of viewTabs) {
        const active = tab.dataset.view === view;

        tab.setAttribute('aria-selected', String(active));
        tab.classList.toggle('is-active', active);
    }

    renderOutputs();
    renderCompare();
}

function updateCompareFromPointer(clientX: number): void {
    const bounds = compareCanvas.getBoundingClientRect();

    if (bounds.width <= 0) {
        return;
    }

    comparePosition = Math.max(0, Math.min(100, ((clientX - bounds.left) / bounds.width) * 100));
    renderCompare();
}

function setSource(data: ImageData, name: string): void {
    sourceImageData = data;
    outputs = [];
    selectedOutput = 0;
    comparePosition = 50;
    view = 'grid';

    paint(sourceCanvas, data);
    sourceDimension.textContent = `${data.width}×${data.height}`;
    sourceName.textContent = name;
    sourceSize.textContent = `${data.width} × ${data.height}`;
    dropzone.hidden = true;
    sourceInfo.hidden = false;

    setError(null);
    syncView();
    setStatus(`Loaded ${name}. Add manipulations and run the workflow.`);
}

function clearSource(): void {
    sourceImageData = null;
    outputs = [];
    selectedOutput = 0;
    view = 'grid';

    clearCanvas(sourceCanvas);
    sourceDimension.textContent = '';
    dropzone.hidden = false;
    sourceInfo.hidden = true;
    uploadInput.value = '';

    syncView();
    setStatus('Image removed. Upload an image to begin.');
}

function clearOutputs(): void {
    outputs = [];
    selectedOutput = 0;

    syncView();
    setStatus('Outputs cleared.');
}

async function decodeFile(file: File): Promise<ImageData> {
    if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image');
    }

    const bitmap = await createImageBitmap(file);

    try {
        decodeCanvas.width = bitmap.width;
        decodeCanvas.height = bitmap.height;

        const context = decodeCanvas.getContext('2d');

        if (!context) {
            throw new Error('Canvas 2D context unavailable');
        }

        context.clearRect(0, 0, bitmap.width, bitmap.height);
        context.drawImage(bitmap, 0, 0);

        return context.getImageData(0, 0, bitmap.width, bitmap.height);
    } finally {
        bitmap.close();
    }
}

function createSampleImageData(): ImageData {
    const size = 200;
    const context = decodeCanvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas 2D context unavailable');
    }

    decodeCanvas.width = size;
    decodeCanvas.height = size;

    const gradient = context.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
    );

    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.2, '#feca57');
    gradient.addColorStop(0.4, '#48dbfb');
    gradient.addColorStop(0.6, '#54a0ff');
    gradient.addColorStop(0.8, '#5f27cd');
    gradient.addColorStop(1, '#222222');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    return context.getImageData(0, 0, size, size);
}

async function loadFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
        setError('Choose an image file (PNG, JPG or WebP).');
        return;
    }

    setStatus(`Reading ${file.name}…`);

    try {
        setSource(await decodeFile(file), file.name);
    } catch (cause) {
        setError(`Could not read image: ${errorMessage(cause)}`);
        setStatus('Image could not be loaded.');
    } finally {
        uploadInput.value = '';
    }
}

function loadSample(): void {
    try {
        setSource(createSampleImageData(), 'sample-gradient');
    } catch (cause) {
        setError(errorMessage(cause));
    }
}

function makeStep(id: string): WorkflowStep {
    const info = manipulationCatalog[id];

    if (!info) {
        throw new Error(`Unknown manipulation: ${id}`);
    }

    return { uid: crypto.randomUUID(), id, options: { ...info.defaultArgs } };
}

function renderStepField(card: HTMLElement, step: WorkflowStep, definition: ArgDefinition): void {
    const field = document.createElement('label');
    const label = document.createElement('span');
    const sliderMount = document.createElement('span');
    const readout = document.createElement('output');
    const initial = numberOption(step.options, definition.key, definition.min);
    const slider = createSlider(sliderMount, {
        min: definition.min,
        max: definition.max,
        step: definition.step,
        value: initial,
    });

    field.className = 'pg-control pg-pixel__step-field';
    label.textContent = definition.label;
    readout.textContent = formatValue(initial, definition.step);
    slider.setAttribute('aria-label', definition.label);
    slider.addEventListener(
        'input',
        () => {
            const value = Number(slider.value);

            step.options[definition.key] = value;
            readout.textContent = formatValue(value, definition.step);
        },
        { signal: listeners.signal },
    );

    field.append(label, sliderMount, readout);
    card.append(field);
}

function renderStepControls(header: HTMLElement, index: number): void {
    const controls = document.createElement('div');
    const up = document.createElement('button');
    const down = document.createElement('button');
    const remove = document.createElement('button');

    controls.className = 'pg-pixel__step-actions';
    up.type = 'button';
    up.textContent = '▲';
    up.disabled = index === 0;
    up.dataset.stepAction = 'up';
    up.dataset.stepIndex = String(index);
    up.setAttribute('aria-label', 'Move step up');
    down.type = 'button';
    down.textContent = '▼';
    down.disabled = index === workflow.length - 1;
    down.dataset.stepAction = 'down';
    down.dataset.stepIndex = String(index);
    down.setAttribute('aria-label', 'Move step down');
    remove.type = 'button';
    remove.textContent = '✕';
    remove.dataset.stepAction = 'remove';
    remove.dataset.stepIndex = String(index);
    remove.setAttribute('aria-label', 'Remove step');

    controls.append(up, down, remove);
    header.append(controls);
}

function renderWorkflow(): void {
    workflowMount.replaceChildren();
    stepCount.textContent = `(${String(workflow.length)})`;

    if (workflow.length === 0) {
        const empty = document.createElement('p');

        empty.className = 'pg-status';
        empty.textContent = 'Add manipulations to build your pipeline.';
        workflowMount.append(empty);
        syncButtons();

        return;
    }

    for (let index = 0; index < workflow.length; index++) {
        const step = workflow[index];
        const info = step ? manipulationCatalog[step.id] : undefined;

        if (!step || !info) {
            continue;
        }

        const card = document.createElement('div');
        const header = document.createElement('div');
        const title = document.createElement('h4');

        card.className = 'pg-pixel__step';
        header.className = 'pg-pixel__step-header';
        title.textContent = `${String(index + 1)}. ${info.name}`;

        header.append(title);
        renderStepControls(header, index);
        card.append(header);

        for (const definition of info.argDefinitions) {
            renderStepField(card, step, definition);
        }

        workflowMount.append(card);
    }

    syncButtons();
}

function setWorkflow(steps: WorkflowStep[], message: string): void {
    if (steps.length > MAX_STEPS) {
        setError(`A workflow is limited to ${String(MAX_STEPS)} steps.`);
        return;
    }

    workflow = steps;

    renderWorkflow();
    syncView();
    setStatus(message);
}

function addStep(id: string): void {
    if (workflow.length >= MAX_STEPS) {
        setError(`A workflow is limited to ${String(MAX_STEPS)} steps.`);
        return;
    }

    setWorkflow([...workflow, makeStep(id)], `${manipulationCatalog[id]?.name ?? id} added.`);
}

function removeStep(index: number): void {
    setWorkflow(
        workflow.filter((_, position) => position !== index),
        'Step removed.',
    );
}

function moveStep(index: number, direction: -1 | 1): void {
    const target = index + direction;

    if (target < 0 || target >= workflow.length) {
        return;
    }

    const updated = [...workflow];
    const current = updated[index];
    const swapped = updated[target];

    if (!current || !swapped) {
        return;
    }

    updated[index] = swapped;
    updated[target] = current;
    setWorkflow(updated, 'Workflow order updated.');
}

function clearWorkflow(): void {
    setWorkflow([], 'Workflow cleared.');
}

function loadPreset(index: number): void {
    const preset = WORKFLOW_PRESETS[index];

    if (!preset) {
        return;
    }

    const steps = preset.steps.map((step) => ({
        uid: crypto.randomUUID(),
        id: step.id,
        options: { ...step.options } as Record<string, unknown>,
    }));

    setWorkflow(steps, `${preset.name} preset loaded. Run the workflow to apply it.`);
}

function isStep(value: unknown): value is Step {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'string' &&
        Object.hasOwn(manipulationCatalog, value.id)
    );
}

function buildSteps(): Step[] {
    const candidates: unknown[] = workflow.map((step) => ({
        id: step.id,
        options: step.options,
    }));

    return candidates.filter((candidate): candidate is Step => isStep(candidate));
}

async function execute(): Promise<void> {
    if (processing || !sourceImageData || workflow.length === 0) {
        return;
    }

    const generation = ++runGeneration;
    const config = {
        sourceImageData,
        steps: buildSteps(),
    };

    setError(null);
    setProcessing(true);
    setStatus('Processing…');

    try {
        const results = await pool.run(config);

        if (tornDown || generation !== runGeneration) {
            return;
        }

        outputs = results.slice(0, MAX_STEPS);
        selectedOutput = Math.min(selectedOutput, Math.max(0, outputs.length - 1));

        syncView();
        setStatus(`Workflow complete — ${String(outputs.length)} snapshots.`);
    } catch (cause) {
        if (tornDown || generation !== runGeneration) {
            return;
        }

        setError(`Pipeline failed: ${errorMessage(cause)}`);
        setStatus('Pipeline failed.');
    } finally {
        if (!tornDown && generation === runGeneration) {
            setProcessing(false);
        }
    }
}

function downloadOutput(index: number): void {
    const canvas = outputCanvases[index];

    if (!canvas || !outputs[index]) {
        return;
    }

    const link = document.createElement('a');

    link.download = `pixel-step-${String(index + 1)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function stopCompareDrag(event: PointerEvent): void {
    if (!isDraggingCompare) {
        return;
    }

    isDraggingCompare = false;

    if (compareCanvas.hasPointerCapture(event.pointerId)) {
        compareCanvas.releasePointerCapture(event.pointerId);
    }
}

for (const [index, preset] of WORKFLOW_PRESETS.entries()) {
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = preset.name;
    button.title = preset.description;
    button.addEventListener('click', () => loadPreset(index), { signal: listeners.signal });
    presetsMount.append(button);
}

for (const tab of viewTabs) {
    tab.addEventListener(
        'click',
        () => {
            view = tab.dataset.view === 'compare' ? 'compare' : 'grid';
            syncView();
        },
        { signal: listeners.signal },
    );
}

uploadInput.addEventListener(
    'change',
    () => {
        const file = uploadInput.files?.[0];

        if (file) {
            void loadFile(file);
        }
    },
    { signal: listeners.signal },
);

dropzone.addEventListener(
    'dragenter',
    (event) => {
        event.preventDefault();
        dragDepth++;
        dropzone.dataset.dragging = 'true';
        dropzoneLabel.textContent = 'Drop to upload';
    },
    { signal: listeners.signal },
);

dropzone.addEventListener(
    'dragleave',
    (event) => {
        event.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);

        if (dragDepth === 0) {
            delete dropzone.dataset.dragging;
            dropzoneLabel.textContent = 'Drop an image here or click to browse';
        }
    },
    { signal: listeners.signal },
);

dropzone.addEventListener('dragover', (event) => event.preventDefault(), {
    signal: listeners.signal,
});

dropzone.addEventListener(
    'drop',
    (event) => {
        event.preventDefault();
        dragDepth = 0;
        delete dropzone.dataset.dragging;
        dropzoneLabel.textContent = 'Drop an image here or click to browse';

        const file = event.dataTransfer?.files[0];

        if (file) {
            void loadFile(file);
        }
    },
    { signal: listeners.signal },
);

clearSourceButton.addEventListener('click', clearSource, { signal: listeners.signal });
clearOutputsButton.addEventListener('click', clearOutputs, { signal: listeners.signal });
addStepButton.addEventListener('click', () => addStep(manipulationSelect.value), {
    signal: listeners.signal,
});
clearWorkflowButton.addEventListener('click', clearWorkflow, { signal: listeners.signal });
executeButton.addEventListener('click', () => void execute(), { signal: listeners.signal });

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-load-sample]')) {
    button.addEventListener('click', loadSample, { signal: listeners.signal });
}

for (const [index, button] of downloadButtons.entries()) {
    button.addEventListener('click', () => downloadOutput(index), { signal: listeners.signal });
}

for (const card of outputCards) {
    card.addEventListener(
        'click',
        () => {
            const index = Number(card.dataset.output);

            if (!Number.isNaN(index) && outputs[index] && view === 'compare') {
                selectedOutput = index;
                renderOutputs();
                renderCompare();
            }
        },
        { signal: listeners.signal },
    );
}

compareSelect.addEventListener(
    'change',
    () => {
        selectedOutput = Number(compareSelect.value);
        renderOutputs();
        renderCompare();
    },
    { signal: listeners.signal },
);

workflowMount.addEventListener(
    'click',
    (event) => {
        const target = event.target;
        const button =
            target instanceof Element
                ? target.closest<HTMLButtonElement>('[data-step-action]')
                : null;

        if (!button) {
            return;
        }

        const index = Number(button.dataset.stepIndex);

        if (Number.isNaN(index)) {
            return;
        }

        switch (button.dataset.stepAction) {
            case 'up': {
                moveStep(index, -1);
                break;
            }
            case 'down': {
                moveStep(index, 1);
                break;
            }
            case 'remove': {
                removeStep(index);
                break;
            }
            case undefined: {
                break;
            }
        }
    },
    { signal: listeners.signal },
);

compareCanvas.addEventListener(
    'pointerdown',
    (event) => {
        if (event.button !== 0) {
            return;
        }

        isDraggingCompare = true;
        compareCanvas.setPointerCapture(event.pointerId);
        updateCompareFromPointer(event.clientX);
    },
    { signal: listeners.signal },
);
compareCanvas.addEventListener(
    'pointermove',
    (event) => {
        if (isDraggingCompare) {
            updateCompareFromPointer(event.clientX);
        }
    },
    { signal: listeners.signal },
);
compareCanvas.addEventListener('pointerup', stopCompareDrag, { signal: listeners.signal });
compareCanvas.addEventListener('pointercancel', stopCompareDrag, { signal: listeners.signal });

window.addEventListener(
    'pagehide',
    () => {
        tornDown = true;
        listeners.abort();
        pool.teardown();
    },
    { once: true, signal: listeners.signal },
);

defineShellElement();
initTheme();
renderWorkflow();
syncView();
