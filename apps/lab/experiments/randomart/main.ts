/*
 * Randomart experiment: one static shell, one WebGL2 canvas, one compiled program at a time.
 * Controls only swap the program and update text/values; the markup is never rebuilt.
 */

import { COLOR_SPACES, isColorSpaceId } from '../../lib/randomart/colors';
import type { ColorSpaceId } from '../../lib/randomart/colors';
import { compile } from '../../lib/randomart/emit';
import type { Compiled } from '../../lib/randomart/emit';
import { generate } from '../../lib/randomart/generate';
import { GRAMMAR_PRESETS, getGrammarPreset } from '../../lib/randomart/grammar';
import type { GrammarPresetId } from '../../lib/randomart/grammar';
import { createSeed, MAX_SEED_LENGTH, parseSeed } from '../../lib/randomart/seed';
import type { Seed } from '../../lib/randomart/seed';
import { formatFormula } from '../../lib/randomart/tree';
import type { Expression } from '../../lib/randomart/tree';
import { GpuSurface, ShaderError } from '../../lib/surface/gpu/index';
import type { Program } from '../../lib/surface/gpu/index';
import { createSelect } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';

const DEFAULT_PRESET = getGrammarPreset('default');

interface Artwork {
    readonly expression: Expression;
    readonly shader: Compiled;
}

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Randomart markup is incomplete: ${selector}`);
    }

    return element;
}

function isGrammarPresetId(value: string): value is GrammarPresetId {
    return GRAMMAR_PRESETS.some((preset) => preset.id === value);
}

function randomSeed(): Seed {
    const bytes = new Uint8Array(8);

    crypto.getRandomValues(bytes);

    return createSeed(Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''));
}

function createSeedInput(mount: HTMLElement, value: string): HTMLInputElement {
    const input = document.createElement('input');

    input.type = 'text';
    input.maxLength = MAX_SEED_LENGTH;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.value = value;
    mount.append(input);

    return input;
}

const viewport = required<HTMLElement>('.pg-canvas-viewport');
const canvas = required<HTMLCanvasElement>('[data-canvas]');
const errorBox = required<HTMLElement>('[data-error]');
const loading = required<HTMLElement>('[data-loading]');
const status = required<HTMLElement>('[data-status]');
const stats = required<HTMLElement>('[data-stats]');
const formula = required<HTMLElement>('[data-formula]');
const shaderSource = required<HTMLElement>('[data-shader-source]');
const grammarMount = required<HTMLElement>('[data-control="grammar"]');
const seedMount = required<HTMLElement>('[data-control="seed"]');
const spaceMount = required<HTMLElement>('[data-control="space"]');
const newSeedButton = required<HTMLButtonElement>('[data-new-seed]');
const regenerateButton = required<HTMLButtonElement>('[data-regenerate]');
const playButton = required<HTMLButtonElement>('[data-play-toggle]');

const grammarOptions = GRAMMAR_PRESETS.map((preset) => ({ value: preset.id, label: preset.label }));
const spaceOptions = COLOR_SPACES.map((space) => ({ value: space.id, label: space.label }));

let grammar = DEFAULT_PRESET.grammar;
let seed = createSeed('pg-lab');
let space: ColorSpaceId = DEFAULT_PRESET.space;

const grammarSelect = createSelect(grammarMount, grammarOptions, DEFAULT_PRESET.id);
const seedInput = createSeedInput(seedMount, seed);
const spaceSelect = createSelect(spaceMount, spaceOptions, space);

let surface: GpuSurface | null = null;
let program: Program | null = null;
let playing = false;
let unsubscribeFrame: (() => void) | null = null;
let renderScheduled = false;
let initialPlayPending = true;
let firstFrame = 0;
let secondFrame = 0;

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

function stopProgram(): void {
    program?.destroy();
    program = null;
}

function buildArtwork(): Artwork {
    const expression = generate(grammar, seed);

    return { expression, shader: compile(expression, { space }) };
}

function publish(artwork: Artwork): void {
    const { expression, shader } = artwork;

    formula.textContent = [
        `R = ${formatFormula(expression.r, 4)}`,
        `G = ${formatFormula(expression.g, 4)}`,
        `B = ${formatFormula(expression.b, 4)}`,
    ].join('\n');
    shaderSource.textContent = shader.source;
    stats.textContent = `Taille : ${shader.stats.sourceLength} caractères · Animé : ${shader.animated ? 'oui' : 'non'}`;
}

function setPlaying(next: boolean): void {
    if (playing === next) {
        return;
    }

    playing = next;
    playButton.textContent = playing ? 'Pause' : 'Lecture';
    playButton.dataset.playing = String(playing);

    unsubscribeFrame?.();
    unsubscribeFrame = null;

    const activeSurface = surface;
    if (playing && activeSurface !== null) {
        unsubscribeFrame = activeSurface.onFrame((frameSurface) => {
            const current = program;
            if (current) {
                frameSurface.renderProgram(current);
            }
        });
        status.textContent = 'Lecture en cours.';
    } else {
        status.textContent = 'Lecture en pause.';
    }
}

function fail(error: unknown): void {
    setPlaying(false);
    stopProgram();

    let message: string;
    if (error instanceof ShaderError) {
        message = `Compilation du shader (${error.stage}) : ${error.log.trim() || error.message}`;
    } else if (error instanceof Error) {
        message = error.message;
    } else {
        message = String(error);
    }

    reportError(message);
}

/** Draws one frame while paused so a control change is visible without resuming the loop. */
function renderOnce(): void {
    const activeSurface = surface;
    if (!activeSurface || !program) {
        return;
    }

    let done = false;
    let stop: (() => void) | null = null;

    // FrameLoop ticks synchronously on subscribe: the callback can run before onFrame returns.
    stop = activeSurface.onFrame((frameSurface) => {
        done = true;
        stop?.();
        stop = null;

        const current = program;
        if (current) {
            frameSurface.renderProgram(current);
        }
    });
    if (done) {
        stop?.();
    }
}

function refresh(): void {
    let artwork: Artwork;
    try {
        artwork = buildArtwork();
    } catch (error) {
        fail(error);
        return;
    }

    publish(artwork);

    const activeSurface = surface;
    if (activeSurface === null) {
        setPlaying(false);
        status.textContent = 'Rendu indisponible (WebGL2).';
        return;
    }

    clearError();

    try {
        const result = activeSurface.tryCreateProgram(artwork.shader.source);

        if (!result.ok) {
            fail(result.error);
            return;
        }

        stopProgram();
        program = result.program;
    } catch (error) {
        fail(error);
        return;
    }

    status.textContent = 'Rendu prêt.';

    if (!playing) {
        renderOnce();
    }

    // The initial render used to be followed by a manual setPlaying(true) at startup.
    if (initialPlayPending) {
        initialPlayPending = false;
        if (surface !== null && program !== null) {
            setPlaying(true);
        }
    }
}

function setLoading(active: boolean): void {
    loading.hidden = !active;
    regenerateButton.disabled = active;
    viewport.setAttribute('aria-busy', String(active));
}

/** Compilation is synchronous: yield two frames so the loading state is painted before the work. */
function scheduleRefresh(): void {
    if (renderScheduled) {
        return;
    }

    renderScheduled = true;
    setLoading(true);
    status.textContent = 'Compilation du shader…';

    firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
            firstFrame = 0;
            secondFrame = 0;

            try {
                refresh();
            } finally {
                renderScheduled = false;
                setLoading(false);
            }
        });
    });
}

grammarSelect.addEventListener('change', () => {
    const value = grammarSelect.value;
    if (!isGrammarPresetId(value)) {
        return;
    }

    const preset = getGrammarPreset(value);

    grammar = preset.grammar;
    space = preset.space;
    spaceSelect.value = space;
    scheduleRefresh();
});

spaceSelect.addEventListener('change', () => {
    const value = spaceSelect.value;
    if (!isColorSpaceId(value)) {
        return;
    }

    space = value;
    scheduleRefresh();
});

seedInput.addEventListener('change', () => {
    const parsed = parseSeed(seedInput.value);

    if (parsed === null) {
        status.textContent = 'Graine invalide : 1 à 64 caractères.';
        seedInput.value = seed;
        return;
    }

    seed = parsed;
    seedInput.value = seed;
    scheduleRefresh();
});

newSeedButton.addEventListener('click', () => {
    seed = randomSeed();
    seedInput.value = seed;
    scheduleRefresh();
});

regenerateButton.addEventListener('click', () => {
    scheduleRefresh();
});

playButton.addEventListener('click', () => {
    setPlaying(!playing);
});

try {
    surface = new GpuSurface(canvas);
} catch {
    reportError('WebGL2 n’est pas disponible dans ce navigateur. Le rendu est désactivé.');
    status.textContent = 'Rendu indisponible.';
}

window.addEventListener(
    'pagehide',
    () => {
        if (firstFrame !== 0) {
            cancelAnimationFrame(firstFrame);
        }
        if (secondFrame !== 0) {
            cancelAnimationFrame(secondFrame);
        }

        setPlaying(false);
        stopProgram();

        const activeSurface = surface;
        activeSurface?.destroy();
        surface = null;
    },
    { once: true },
);

defineShellElement();
initTheme();
scheduleRefresh();
