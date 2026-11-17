/*
 * Automa experiment: one static shell, one WebGL2 canvas and module-local state.
 * The GPU simulation, rules, creatures and grid helpers are ported unchanged under core/;
 * only the React/state-library shell has been replaced with native DOM wiring.
 */

import { Camera2D } from '../../lib/surface/core/Camera2D';
import { GpuSurface } from '../../lib/surface/gpu/GpuSurface';
import type { Program } from '../../lib/surface/gpu/Program';
import { ShaderError } from '../../lib/surface/gpu/ShaderError';
import type { UniformValue } from '../../lib/surface/gpu/types';
import { createSelect, createSlider } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';
import {
    GRID_DEFAULT_COLS,
    GRID_DEFAULT_DENSITY,
    GRID_DEFAULT_ROWS,
    GRID_DEFAULT_SEED,
} from './core/engine/config';
import { allCreatures, getCreature } from './core/engine/creature/registry';
import type { CreatureId } from './core/engine/creature/registry';
import cellMeshShader from './core/engine/gpu/shaders/cell-mesh.frag?raw';
import gpuPaintShader from './core/engine/gpu/shaders/gpu-paint.frag?raw';
import simStepShader from './core/engine/gpu/shaders/sim-step.frag?raw';
import { SimulationEngine } from './core/engine/gpu/SimulationEngine';
import { allRules, getRule } from './core/engine/rules/registry';
import type { RuleId } from './core/engine/rules/registry';
import { buildStateColorArray, computeDerivedColors, parseColor } from './core/lib/colors';
import {
    DEFAULT_STATE_COLORS,
    SPEED_DEFAULT_MS,
    SPEED_MAX_MS,
    SPEED_MIN_MS,
    SPEED_STEP_MS,
    TRAIL_COLOR,
    TRAIL_STRENGTH,
} from './core/lib/constants';
import type { CssColor } from './core/lib/constants';
import { eventToGridPoint } from './core/lib/coordinates';
import { computeGridRect } from './core/lib/gridPlacement';

type BrushMode = 'draw' | 'erase';
type CreatureBrush = CreatureId | 'pixel';
type DragMode = 'paint' | 'pan';

const DEAD_COLOR_FALLBACK = '#070a14';
const ALIVE_COLOR_FALLBACK = '#d97706';

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Automa markup is incomplete: ${selector}`);
    }

    return element;
}

function createColorInput(mount: HTMLElement, value: string): HTMLInputElement {
    const input = document.createElement('input');

    input.type = 'color';
    input.value = value;
    mount.append(input);

    return input;
}

function isRuleId(value: string): value is RuleId {
    return allRules.some((rule) => rule.id === value);
}

function isCreatureBrush(value: string): value is CreatureBrush {
    return value === 'pixel' || allCreatures.some((creature) => creature.id === value);
}

const canvas = required<HTMLCanvasElement>('[data-canvas]');
const errorBox = required<HTMLElement>('[data-error]');
const status = required<HTMLElement>('[data-status]');
const generationValue = required<HTMLOutputElement>('[data-generation]');
const playButton = required<HTMLButtonElement>('[data-play-toggle]');
const stepButton = required<HTMLButtonElement>('[data-step]');
const randomizeButton = required<HTMLButtonElement>('[data-randomize]');
const clearButton = required<HTMLButtonElement>('[data-clear]');
const drawButton = required<HTMLButtonElement>('[data-tool="draw"]');
const eraseButton = required<HTMLButtonElement>('[data-tool="erase"]');
const speedValue = required<HTMLOutputElement>('[data-value="speed"]');
const speedSlider = createSlider(required<HTMLElement>('[data-control="speed"]'), {
    min: SPEED_MIN_MS,
    max: SPEED_MAX_MS,
    step: SPEED_STEP_MS,
    value: SPEED_DEFAULT_MS,
});
const ruleSelect = createSelect(
    required<HTMLElement>('[data-control="rule"]'),
    allRules.map((rule) => ({ value: rule.id, label: rule.name })),
    'conway',
);
const creatureSelect = createSelect(
    required<HTMLElement>('[data-control="creature"]'),
    [
        { value: 'pixel', label: 'Pixel' },
        ...allCreatures.map((creature) => ({ value: creature.id, label: creature.name })),
    ],
    'pixel',
);
const deadColorInput = createColorInput(
    required<HTMLElement>('[data-control="color-dead"]'),
    DEFAULT_STATE_COLORS[0] ?? DEAD_COLOR_FALLBACK,
);
const aliveColorInput = createColorInput(
    required<HTMLElement>('[data-control="color-alive"]'),
    DEFAULT_STATE_COLORS[1] ?? ALIVE_COLOR_FALLBACK,
);

const camera = new Camera2D({ minZoom: 1, maxZoom: 64 });

let surface: GpuSurface | null = null;
let engine: SimulationEngine | null = null;
let displayProgram: Program | null = null;
let frameSubscription: (() => void) | null = null;

let ruleId: RuleId = 'conway';
let stateColors: CssColor[] = [...DEFAULT_STATE_COLORS];
let speedMs = SPEED_DEFAULT_MS;
let generation = 0;
let running = false;
let toolMode: BrushMode = 'draw';
let paletteBrush: CreatureBrush = 'pixel';

let drag: DragMode | null = null;
let lastPointer = { x: 0, y: 0 };

function shaderMessage(error: unknown): string {
    if (error instanceof ShaderError) {
        return `Shader (${error.stage}) : ${error.log.trim() || error.message}`;
    }

    return error instanceof Error ? error.message : String(error);
}

function reportError(message: string): void {
    errorBox.textContent = message;
    errorBox.hidden = false;
    canvas.classList.add('pg-canvas--error');
    status.textContent = 'Erreur.';
}

function clearError(): void {
    errorBox.textContent = '';
    errorBox.hidden = true;
    canvas.classList.remove('pg-canvas--error');
}

function setGeneration(next: number): void {
    generation = next;
    generationValue.textContent = String(generation);
}

function buildDisplayUniforms(
    activeSurface: GpuSurface,
    activeEngine: SimulationEngine,
): Record<string, UniformValue> {
    const rect = computeGridRect(
        activeSurface.width,
        activeSurface.height,
        activeEngine.width,
        activeEngine.height,
    );
    const dead = parseColor(stateColors[0] ?? DEAD_COLOR_FALLBACK);

    return {
        u_grid: activeEngine.getDisplayTexture(),
        u_stateColors: buildStateColorArray(stateColors),
        u_background: [dead.r, dead.g, dead.b],
        u_trailColor: TRAIL_COLOR,
        u_trailStrength: TRAIL_STRENGTH,
        u_gridOrigin: [rect.originX, rect.originY],
        u_gridScale: rect.scale,
        u_gridSize: [activeEngine.width, activeEngine.height],
        u_viewSize: [activeSurface.width, activeSurface.height],
        u_camera: [camera.x, camera.y, camera.zoom],
    };
}

function paintFrame(activeSurface: GpuSurface): void {
    const activeEngine = engine;
    const program = displayProgram;

    if (!activeEngine || !program) {
        return;
    }

    activeSurface.renderProgram(program, buildDisplayUniforms(activeSurface, activeEngine));
}

function advanceFrame(activeSurface: GpuSurface): void {
    engine?.tick(activeSurface.deltaTime);
    paintFrame(activeSurface);
}

/** Paints one frame while paused so a control change is visible without resuming the loop. */
function renderOnce(): void {
    const activeSurface = surface;

    if (!activeSurface || running) {
        return;
    }

    let done = false;
    let stop: (() => void) | null = null;

    stop = activeSurface.onFrame((frameSurface) => {
        done = true;
        stop?.();
        stop = null;
        paintFrame(frameSurface);
    });
    if (done) {
        stop?.();
    }
}

function stopFrameLoop(): void {
    frameSubscription?.();
    frameSubscription = null;
}

function syncFrameLoop(): void {
    stopFrameLoop();

    if (running && surface) {
        frameSubscription = surface.onFrame(advanceFrame);
    } else {
        renderOnce();
    }
}

function destroySimulation(): void {
    stopFrameLoop();
    engine?.destroy();
    engine = null;
    displayProgram?.destroy();
    displayProgram = null;
}

function initSimulation(): void {
    destroySimulation();

    const activeSurface = surface;

    if (!activeSurface) {
        return;
    }

    try {
        displayProgram = activeSurface.createProgram(cellMeshShader);
        const buffer = activeSurface.createTargetPair(GRID_DEFAULT_COLS, GRID_DEFAULT_ROWS);
        const simProgram = activeSurface.createProgram(simStepShader);
        const paintProgram = activeSurface.createProgram(gpuPaintShader);

        engine = new SimulationEngine(buffer, simProgram, paintProgram, {
            rows: GRID_DEFAULT_ROWS,
            cols: GRID_DEFAULT_COLS,
            rule: getRule(ruleId),
            density: GRID_DEFAULT_DENSITY,
            seed: GRID_DEFAULT_SEED,
            speedMs,
            onGenerationChange: setGeneration,
        });
    } catch (error) {
        destroySimulation();
        reportError(shaderMessage(error));
        return;
    }

    clearError();
    setGeneration(0);

    if (running) {
        engine.play();
    }

    syncFrameLoop();
    status.textContent = running ? 'Lecture en cours.' : 'Rendu prêt.';
}

function syncPlayButton(): void {
    playButton.textContent = running ? 'Pause' : 'Lecture';
    playButton.dataset.playing = String(running);
    stepButton.disabled = running;
}

function setPlaying(next: boolean): void {
    if (running === next) {
        return;
    }

    running = next;

    if (running) {
        engine?.play();
    } else {
        engine?.pause();
    }

    syncPlayButton();
    syncFrameLoop();
    status.textContent = running ? 'Lecture en cours.' : 'Lecture en pause.';
}

function syncToolButtons(): void {
    drawButton.setAttribute('aria-pressed', String(toolMode === 'draw'));
    eraseButton.setAttribute('aria-pressed', String(toolMode === 'erase'));
}

function setToolMode(mode: BrushMode): void {
    toolMode = mode;
    syncToolButtons();
}

function recomputeDerivedColors(): void {
    stateColors = computeDerivedColors(
        getRule(ruleId).stateCount,
        stateColors[0] ?? DEAD_COLOR_FALLBACK,
        stateColors[1] ?? ALIVE_COLOR_FALLBACK,
    );
}

function setStateColor(index: 0 | 1, color: CssColor): void {
    const dead = index === 0 ? color : (stateColors[0] ?? DEAD_COLOR_FALLBACK);
    const alive = index === 1 ? color : (stateColors[1] ?? ALIVE_COLOR_FALLBACK);

    stateColors = computeDerivedColors(getRule(ruleId).stateCount, dead, alive);
    renderOnce();
}

function paintAtEvent(event: PointerEvent): void {
    const activeEngine = engine;

    if (!activeEngine) {
        return;
    }

    const cell = eventToGridPoint(event, canvas, activeEngine.width, activeEngine.height, camera);

    if (!cell) {
        return;
    }

    const brush = paletteBrush;

    if (toolMode !== 'erase' && brush !== 'pixel') {
        activeEngine.placeCreature(cell.column, cell.row, getCreature(brush));
    } else {
        activeEngine.paintCell(cell.column, cell.row, toolMode === 'erase' ? 0 : 1);
    }

    renderOnce();
}

function handlePointerDown(event: PointerEvent): void {
    lastPointer = { x: event.clientX, y: event.clientY };

    if (event.button === 1) {
        event.preventDefault();
        drag = 'pan';
        canvas.setPointerCapture(event.pointerId);
    } else if (event.button === 0) {
        drag = 'paint';
        paintAtEvent(event);
        canvas.setPointerCapture(event.pointerId);
    }
}

function handlePointerMove(event: PointerEvent): void {
    if (drag === 'paint') {
        paintAtEvent(event);
    } else if (drag === 'pan') {
        camera.panBy(event.clientX - lastPointer.x, event.clientY - lastPointer.y);
        renderOnce();
    }

    lastPointer = { x: event.clientX, y: event.clientY };
}

function handlePointerEnd(event: PointerEvent): void {
    drag = null;

    if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
}

function handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const bounds = canvas.getBoundingClientRect();

    camera.zoomBy(event.deltaY < 0 ? 1.15 : 0.85, {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
    });
    renderOnce();
}

function handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
}

playButton.addEventListener('click', () => {
    setPlaying(!running);
});

stepButton.addEventListener('click', () => {
    if (running) {
        return;
    }

    engine?.step();
    renderOnce();
});

speedSlider.addEventListener('input', () => {
    const next = Number(speedSlider.value);

    if (!Number.isFinite(next)) {
        return;
    }

    speedMs = next;
    speedValue.value = `${next} ms`;
    engine?.setSpeed(next);
});

randomizeButton.addEventListener('click', () => {
    engine?.randomize();
    renderOnce();
});

clearButton.addEventListener('click', () => {
    engine?.clear();
    renderOnce();
});

drawButton.addEventListener('click', () => {
    setToolMode('draw');
});

eraseButton.addEventListener('click', () => {
    setToolMode('erase');
});

ruleSelect.addEventListener('change', () => {
    const value = ruleSelect.value;

    if (!isRuleId(value)) {
        return;
    }

    ruleId = value;
    engine?.setRule(getRule(value));
    recomputeDerivedColors();
    renderOnce();
});

creatureSelect.addEventListener('change', () => {
    const value = creatureSelect.value;

    if (isCreatureBrush(value)) {
        paletteBrush = value;
    }
});

deadColorInput.addEventListener('input', () => {
    setStateColor(0, deadColorInput.value);
});

aliveColorInput.addEventListener('input', () => {
    setStateColor(1, aliveColorInput.value);
});

canvas.addEventListener('pointerdown', handlePointerDown);
canvas.addEventListener('pointermove', handlePointerMove);
canvas.addEventListener('pointerup', handlePointerEnd);
canvas.addEventListener('pointercancel', handlePointerEnd);
canvas.addEventListener('wheel', handleWheel, { passive: false });
canvas.addEventListener('contextmenu', handleContextMenu);

window.addEventListener(
    'pagehide',
    () => {
        destroySimulation();
        surface?.destroy();
        surface = null;
    },
    { once: true },
);

defineShellElement();
initTheme();
syncPlayButton();
syncToolButtons();
speedValue.value = `${speedMs} ms`;

try {
    surface = new GpuSurface(canvas);
    surface.onContextRestored(() => {
        initSimulation();
    });
    initSimulation();
} catch {
    reportError('WebGL2 n’est pas disponible dans ce navigateur. Le rendu est désactivé.');
    status.textContent = 'Rendu indisponible.';
}
