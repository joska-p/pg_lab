/*
 * Static fracture page: one shell, one canvas, one compiled fragment program at
 * a time. All experiment state lives in module variables; native inputs drive
 * those variables and request a single frame. The canvas is never rebuilt.
 */

import './styles.css';
import { Camera2D } from '../../lib/surface/core/Camera2D';
import type { UniformValue } from '../../lib/surface/gpu/index';
import { createSelect, createSlider, createTextInput } from '../../ui/controls';
import { GpuStage } from '../../ui/gpu-stage';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';
import { cameraToComplex, complexToCamera } from './core/camera';
import {
    DEFAULT_EXPERIMENT,
    EXPERIMENTS,
    EXPERIMENT_OPTIONS,
    getExperiment,
    isExperimentId,
} from './core/experiments';
import type { ExperimentId } from './core/experiments';
import { computeMaxIterations } from './core/iterationPolicy';
import { createParams } from './core/params';
import type { FractalParams, ParamKey } from './core/params';
import { PerturbationRuntime } from './core/perturbationRuntime';
import { CURATED_PRESETS } from './core/presets';
import type { CameraPreset } from './core/presets';
import {
    doubleSplitUniforms,
    juliaDoubleSplitUniforms,
    juliaUniforms,
    naiveUniforms,
    perturbationUniforms,
} from './core/uniforms';
import type { CameraView } from './core/uniforms';

const JULIA_LIMIT = 2;
/** Matches the React scene's `zoom: { speed: 1.2 }` wheel configuration. */
const WHEEL_ZOOM_SPEED = 1.2;

interface SliderSpec {
    key: ParamKey;
    min: number;
    max: number;
    step: number;
}

// Same ranges as the source module control panels (identical in all five modules).
const SLIDER_SPECS: readonly SliderSpec[] = [
    { key: 'iterationBase', min: 20, max: 200, step: 5 },
    { key: 'iterationScale', min: 5, max: 80, step: 1 },
    { key: 'iterationCap', min: 200, max: 3000, step: 50 },
    { key: 'pixelEps', min: 0.0005, max: 0.1, step: 0.0005 },
    { key: 'interiorScale', min: 2.0, max: 25.0, step: 0.5 },
    { key: 'sunAngle', min: 0, max: 6.283, step: 0.01 },
    { key: 'bumpHeight', min: 1.0, max: 50.0, step: 0.5 },
    { key: 'ambientLight', min: 0.0, max: 0.8, step: 0.01 },
    { key: 'hueShift', min: 0, max: 6.283, step: 0.01 },
    { key: 'hueFrequency', min: 0.01, max: 0.5, step: 0.001 },
    { key: 'chromaScale', min: 0.0, max: 0.25, step: 0.005 },
];

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Fracture markup is incomplete: ${selector}`);
    }

    return element;
}

function formatCenter(value: number): string {
    return value.toPrecision(8);
}

function formatZoom(zoom: number): string {
    return zoom >= 10000 ? zoom.toExponential(2) : zoom.toFixed(1);
}

// --- Static markup ---------------------------------------------------------

const canvas = required<HTMLCanvasElement>('[data-canvas]');
const errorBox = required<HTMLElement>('[data-error]');
const statusLine = required<HTMLElement>('[data-status]');
const experimentMount = required<HTMLElement>('[data-control="experiment"]');
const juliaSection = required<HTMLElement>('[data-julia-section]');
const juliaReMount = required<HTMLElement>('[data-control="julia-re"]');
const juliaImMount = required<HTMLElement>('[data-control="julia-im"]');
const readoutRe = required<HTMLElement>('[data-readout="center-re"]');
const readoutIm = required<HTMLElement>('[data-readout="center-im"]');
const readoutZoom = required<HTMLElement>('[data-readout="zoom"]');
const readoutIterations = required<HTMLElement>('[data-readout="iterations"]');
const iterationsHint = required<HTMLElement>('[data-iterations-hint]');
const curatedPresetsMount = required<HTMLElement>('[data-presets-curated]');
const capturedPresetsMount = required<HTMLElement>('[data-presets-captured]');
const captureButton = required<HTMLButtonElement>('[data-capture-view]');
const resetButton = required<HTMLButtonElement>('[data-reset-view]');
const playButton = required<HTMLButtonElement>('[data-play-toggle]');

// --- Module state ----------------------------------------------------------

/** Explicit keys keep the per-experiment records fully typed without assertions. */
function createRecord<T>(factory: (id: ExperimentId) => T): Record<ExperimentId, T> {
    return {
        'mandelbrot-naive': factory('mandelbrot-naive'),
        'mandelbrot-double-split': factory('mandelbrot-double-split'),
        'mandelbrot-perturbation': factory('mandelbrot-perturbation'),
        'julia-naive': factory('julia-naive'),
        'julia-double-split': factory('julia-double-split'),
    };
}

const cameras = createRecord((id) => new Camera2D({ maxZoom: getExperiment(id).maxZoom }));
const paramsById = createRecord(() => createParams());
const capturedByExperiment = createRecord<CameraPreset[]>(() => []);
const sliders = new Map<ParamKey, HTMLInputElement>();
const unsubscribes: Array<() => void> = [];

let experimentId: ExperimentId = DEFAULT_EXPERIMENT.id;
let stage: GpuStage | null = null;
let perturbationRuntime: PerturbationRuntime | null = null;
let resizeObserver: ResizeObserver | null = null;
let panPointerId: number | null = null;
let lastPanX = 0;
let lastPanY = 0;

// --- Native controls -------------------------------------------------------

const experimentSelect = createSelect(experimentMount, EXPERIMENT_OPTIONS, experimentId);
const initialParams = paramsById[experimentId];

for (const spec of SLIDER_SPECS) {
    const mount = required<HTMLElement>(`[data-control="${spec.key}"]`);

    sliders.set(
        spec.key,
        createSlider(mount, {
            min: spec.min,
            max: spec.max,
            step: spec.step,
            value: initialParams[spec.key],
        }),
    );
}

const juliaReInput = createTextInput(juliaReMount, String(initialParams.juliaRe));
const juliaImInput = createTextInput(juliaImMount, String(initialParams.juliaIm));

juliaReInput.inputMode = 'decimal';
juliaImInput.inputMode = 'decimal';

// --- State helpers ---------------------------------------------------------

function currentCamera(): Camera2D {
    return cameras[experimentId];
}

function currentParams(): FractalParams {
    return paramsById[experimentId];
}

function viewportOf(camera: Camera2D): { width: number; height: number } {
    const viewport = camera.getViewport();

    return { width: viewport?.width ?? 1, height: viewport?.height ?? 1 };
}

function renderOnce(): void {
    stage?.renderOnce();
}

function syncPlayButton(): void {
    const playing = stage?.isPlaying ?? false;

    playButton.textContent = playing ? 'Pause' : 'Play';
    playButton.dataset.playing = String(playing);
}

function updateIterationsHint(): void {
    const params = currentParams();
    const values = [1, 1e3, 1e6].map((zoom) =>
        computeMaxIterations(
            zoom,
            params.iterationBase,
            params.iterationScale,
            params.iterationCap,
        ),
    );

    iterationsHint.textContent = `iterations @ 1 / 1e3 / 1e6 · ${values.join(' / ')}`;
}

function updateViewReadouts(): void {
    const camera = currentCamera();
    const { width, height } = viewportOf(camera);
    const { centerRe, centerIm } = cameraToComplex(camera.x, camera.y, camera.zoom, width, height);
    const params = currentParams();

    readoutRe.textContent = formatCenter(centerRe);
    readoutIm.textContent = formatCenter(centerIm);
    readoutZoom.textContent = formatZoom(camera.zoom);
    readoutIterations.textContent = String(
        computeMaxIterations(
            camera.zoom,
            params.iterationBase,
            params.iterationScale,
            params.iterationCap,
        ),
    );
}

function syncControls(): void {
    const params = currentParams();

    for (const [key, slider] of sliders) {
        slider.value = String(params[key]);
    }

    juliaReInput.value = String(params.juliaRe);
    juliaImInput.value = String(params.juliaIm);
    juliaSection.hidden = !getExperiment(experimentId).hasJuliaConstant;
    updateIterationsHint();
}

function applyView(camera: Camera2D, preset: CameraPreset): void {
    const clampedZoom = Math.min(Math.max(preset.zoom, camera.minZoom), camera.maxZoom);
    const { width, height } = viewportOf(camera);
    const { x, y } = complexToCamera(preset.centerRe, preset.centerIm, clampedZoom, width, height);

    camera.patch({ x, y, zoom: clampedZoom });
}

function presetButton(preset: CameraPreset): HTMLButtonElement {
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = preset.label;
    button.addEventListener('click', () => {
        applyView(currentCamera(), preset);
    });

    return button;
}

function renderCuratedPresets(): void {
    curatedPresetsMount.replaceChildren(...CURATED_PRESETS.map(presetButton));
}

function renderCapturedPresets(): void {
    capturedPresetsMount.replaceChildren(...capturedByExperiment[experimentId].map(presetButton));
}

function captureCurrentView(): void {
    const camera = currentCamera();
    const { width, height } = viewportOf(camera);
    const view = cameraToComplex(camera.x, camera.y, camera.zoom, width, height);
    const captured = capturedByExperiment[experimentId];

    captured.push({
        id: `captured-${captured.length + 1}`,
        label: `Captured ${captured.length + 1}`,
        centerRe: view.centerRe,
        centerIm: view.centerIm,
        zoom: camera.zoom,
    });
    renderCapturedPresets();
}

function selectExperiment(nextId: ExperimentId): void {
    experimentId = nextId;
    syncControls();
    renderCapturedPresets();
    stage?.setFragment(getExperiment(nextId).fragment);
    updateViewReadouts();
}

// --- Uniform provider for GpuStage ----------------------------------------

function provideUniforms(): Record<string, UniformValue> {
    const activeStage = stage;

    if (!activeStage) {
        return {};
    }

    const width = Math.max(1, activeStage.surface.width);
    const height = Math.max(1, activeStage.surface.height);
    const camera = currentCamera();

    camera.setViewport({ width, height });

    const view: CameraView = { x: camera.x, y: camera.y, zoom: camera.zoom };
    const params = currentParams();

    switch (experimentId) {
        case 'mandelbrot-naive': {
            return naiveUniforms(params, view, width, height);
        }
        case 'mandelbrot-double-split': {
            return doubleSplitUniforms(params, view, width, height);
        }
        case 'mandelbrot-perturbation': {
            if (!perturbationRuntime) {
                perturbationRuntime = new PerturbationRuntime(activeStage.surface.gl);
            }

            return perturbationUniforms(params, view, width, height, perturbationRuntime);
        }
        case 'julia-naive': {
            return juliaUniforms(params, view, width, height);
        }
        case 'julia-double-split': {
            return juliaDoubleSplitUniforms(params, view, width, height);
        }
        default: {
            return {};
        }
    }
}

// --- Event wiring ----------------------------------------------------------

experimentSelect.addEventListener('change', () => {
    const value = experimentSelect.value;

    if (isExperimentId(value)) {
        selectExperiment(value);
    }
});

for (const [key, slider] of sliders) {
    slider.addEventListener('input', () => {
        currentParams()[key] = Number(slider.value);
        updateIterationsHint();
        updateViewReadouts();
        renderOnce();
    });
}

function bindJuliaInput(input: HTMLInputElement, key: 'juliaRe' | 'juliaIm'): void {
    input.addEventListener('change', () => {
        const value = Number(input.value);

        if (!Number.isFinite(value) || Math.abs(value) > JULIA_LIMIT) {
            input.value = String(currentParams()[key]);
            statusLine.textContent = 'Julia constant must be a finite number in [-2, 2].';
            return;
        }

        currentParams()[key] = value;
        renderOnce();
    });
}

bindJuliaInput(juliaReInput, 'juliaRe');
bindJuliaInput(juliaImInput, 'juliaIm');

captureButton.addEventListener('click', captureCurrentView);
resetButton.addEventListener('click', () => {
    currentCamera().reset();
});

playButton.addEventListener('click', () => {
    const next = !(stage?.isPlaying ?? false);

    stage?.setPlaying(next);
    syncPlayButton();
    statusLine.textContent = next ? 'Continuous rendering.' : 'On-demand rendering.';
});

for (const experiment of EXPERIMENTS) {
    unsubscribes.push(
        cameras[experiment.id].subscribe(() => {
            if (experimentId !== experiment.id) {
                return;
            }

            updateViewReadouts();
            renderOnce();
        }),
    );
}

function handlePointerDown(event: PointerEvent): void {
    if (event.button !== 0 && event.button !== 1) {
        return;
    }

    event.preventDefault();
    panPointerId = event.pointerId;
    lastPanX = event.clientX;
    lastPanY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
}

function handlePointerMove(event: PointerEvent): void {
    if (panPointerId !== event.pointerId) {
        return;
    }

    currentCamera().panBy(event.clientX - lastPanX, event.clientY - lastPanY);
    lastPanX = event.clientX;
    lastPanY = event.clientY;
}

function handlePointerEnd(event: PointerEvent): void {
    if (panPointerId !== event.pointerId) {
        return;
    }

    panPointerId = null;

    if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
}

function handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const focal = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const factor = WHEEL_ZOOM_SPEED ** (-event.deltaY / 100);

    currentCamera().zoomBy(factor, focal);
}

canvas.addEventListener('pointerdown', handlePointerDown);
canvas.addEventListener('pointermove', handlePointerMove);
canvas.addEventListener('pointerup', handlePointerEnd);
canvas.addEventListener('pointercancel', handlePointerEnd);
canvas.addEventListener('wheel', handleWheel, { passive: false });

window.addEventListener(
    'pagehide',
    () => {
        resizeObserver?.disconnect();
        resizeObserver = null;

        for (const unsubscribe of unsubscribes) {
            unsubscribe();
        }

        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerEnd);
        canvas.removeEventListener('pointercancel', handlePointerEnd);
        canvas.removeEventListener('wheel', handleWheel);

        perturbationRuntime?.dispose();
        perturbationRuntime = null;
        stage?.destroy();
        stage = null;
    },
    { once: true },
);

// --- Bootstrap -------------------------------------------------------------

function bootstrapStage(): void {
    let created: GpuStage;

    try {
        created = new GpuStage(canvas, {
            fragment: DEFAULT_EXPERIMENT.fragment,
            onError: (message) => {
                errorBox.textContent = message;
                errorBox.hidden = false;
                canvas.classList.add('pg-canvas--error');
                statusLine.textContent = 'Shader error.';
            },
            onReady: () => {
                errorBox.textContent = '';
                errorBox.hidden = true;
                canvas.classList.remove('pg-canvas--error');
                statusLine.textContent = 'Ready.';
            },
        });
    } catch {
        errorBox.textContent = 'WebGL2 is not available in this browser. Rendering is disabled.';
        errorBox.hidden = false;
        statusLine.textContent = 'Rendering unavailable.';
        return;
    }

    stage = created;
    created.setUniforms(provideUniforms);

    created.surface.onContextRestored((surface) => {
        perturbationRuntime?.restore(surface.gl);
        created.renderOnce();
    });

    // Panel resizing changes the canvas without a window resize event.
    resizeObserver = new ResizeObserver(() => {
        created.renderOnce();
        updateViewReadouts();
    });
    resizeObserver.observe(canvas);

    syncPlayButton();
    updateViewReadouts();
}

defineShellElement();
initTheme();
renderCuratedPresets();
renderCapturedPresets();
syncControls();
bootstrapStage();
