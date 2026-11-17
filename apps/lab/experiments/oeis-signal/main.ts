/*
 * OEIS Signal: the naturals module produces one value per frame. Two renderers share the same
 * CanvasStage; changing a control never recreates the canvas or the signal implementation.
 * The canvas is sized in CSS pixels and scaled to the device pixel ratio by CanvasStage.
 */

import { CanvasStage } from '../../ui/canvas-stage';
import type { Frame } from '../../ui/canvas-stage';
import { createSelect, createSlider } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { applyTheme, getTheme, setTheme } from '../../ui/theme';
import { getModule } from './core/registry';
import type { Signal } from './core/types';
import { createPolylineViz } from './viz/polyline';
import type { Viz } from './viz/types';

type Mode = 'points' | 'polyline';
type ThemeMode = 'light' | 'dark' | 'system';

const PADDING = 24;
const module = getModule('naturals');

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`OEIS Signal markup is incomplete: ${selector}`);
    }

    return element;
}

function isMode(value: string): value is Mode {
    return value === 'points' || value === 'polyline';
}

function isThemeMode(value: string): value is ThemeMode {
    return value === 'light' || value === 'dark' || value === 'system';
}

function systemTheme(): 'light' | 'dark' {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const canvas = required<HTMLCanvasElement>('[data-canvas]');
const status = required<HTMLElement>('[data-status]');
const modeMount = required<HTMLElement>('[data-control="mode"]');
const termsMount = required<HTMLElement>('[data-control="terms"]');
const rateMount = required<HTMLElement>('[data-control="rate"]');
const themeMount = required<HTMLElement>('[data-control="theme"]');
const termsOutput = required<HTMLOutputElement>('[data-value="terms"]');
const rateOutput = required<HTMLOutputElement>('[data-value="rate"]');
const playButton = required<HTMLButtonElement>('[data-play-toggle]');
const resetButton = required<HTMLButtonElement>('[data-reset]');

let mode: Mode = 'points';
let maxTerms = 1000;
let termsPerFrame = 1;
let playing = false;
let stopLoop: (() => void) | null = null;
let lastWidth = 0;
let lastHeight = 0;

const modeSelect = createSelect(
    modeMount,
    [
        { value: 'points', label: 'Points (accumulation)' },
        { value: 'polyline', label: 'Polyligne' },
    ],
    mode,
);
const termsSlider = createSlider(termsMount, { min: 100, max: 1000, step: 100, value: maxTerms });
const rateSlider = createSlider(rateMount, { min: 1, max: 10, step: 1, value: termsPerFrame });
const themeSelect = createSelect(
    themeMount,
    [
        { value: 'light', label: 'Clair' },
        { value: 'dark', label: 'Sombre' },
        { value: 'system', label: 'Système' },
    ],
    getTheme(),
);

const stage = new CanvasStage(canvas);

let signal: Signal = module.createSignal({ maxTerms });
let viz: Viz = createPolylineViz({
    maxTerms,
    termsPerFrame,
    color: '#38bdf8',
    pointRadius: 3,
    lineWidth: 2,
});

function report(): void {
    status.textContent = `${String(signal.produced)} / ${String(maxTerms)} termes · ${mode}`;
}

function clearCanvas(): void {
    const { context, size } = stage;

    context.clearRect(0, 0, size.width, size.height);
}

function restart(): void {
    signal = module.createSignal({ maxTerms });
    viz = createPolylineViz({
        maxTerms,
        termsPerFrame,
        color: '#38bdf8',
        pointRadius: 3,
        lineWidth: 2,
    });
    clearCanvas();
    report();
}

function renderPoints(frame: Frame): boolean {
    const { context, size } = frame;
    const step = Math.min(size.width - PADDING * 2, size.height - PADDING * 2) / maxTerms;
    const originY = size.height - PADDING;

    context.strokeStyle = '#e11d48';
    context.lineWidth = 1;

    for (let index = 0; index < termsPerFrame; index++) {
        const next = signal.next();

        if (next.done) {
            return true;
        }

        const value = next.value;
        context.beginPath();
        context.arc(PADDING + value * step, originY - value * step, 5, 0, Math.PI * 2);
        context.stroke();
    }

    return false;
}

function renderPolyline(frame: Frame): boolean {
    const { context, size } = frame;

    context.save();
    context.translate(PADDING, size.height - PADDING);
    viz.render(signal, {
        ctx: context,
        width: size.width,
        height: size.height,
        dpr: size.dpr,
    });
    context.restore();

    return signal.produced >= maxTerms;
}

function stopPlaying(): void {
    if (!playing) {
        return;
    }

    playing = false;
    playButton.textContent = 'Lecture';
    playButton.dataset.playing = 'false';
    stopLoop?.();
    stopLoop = null;
    status.textContent = 'Lecture terminée.';
}

function render(frame: Frame): void {
    if (frame.size.width !== lastWidth || frame.size.height !== lastHeight) {
        lastWidth = frame.size.width;
        lastHeight = frame.size.height;
        restart();
    }

    const finished = mode === 'points' ? renderPoints(frame) : renderPolyline(frame);

    report();

    if (finished) {
        stopPlaying();
    }
}

function setPlaying(next: boolean): void {
    if (playing === next) {
        return;
    }

    playing = next;
    playButton.textContent = playing ? 'Pause' : 'Lecture';
    playButton.dataset.playing = String(playing);

    stopLoop?.();
    stopLoop = null;

    if (playing) {
        stopLoop = stage.subscribe(render);
    }
}

modeSelect.addEventListener('change', () => {
    const value = modeSelect.value;

    if (!isMode(value)) {
        return;
    }

    mode = value;
    restart();
    stage.renderOnce();
});

termsSlider.addEventListener('input', () => {
    maxTerms = Number(termsSlider.value);
    termsOutput.value = String(maxTerms);
    restart();
    stage.renderOnce();
});

rateSlider.addEventListener('input', () => {
    termsPerFrame = Number(rateSlider.value);
    rateOutput.value = String(termsPerFrame);
    // The polyline viz captures the rate at creation time; rebuild it in place.
    viz = createPolylineViz({
        maxTerms,
        termsPerFrame,
        color: '#38bdf8',
        pointRadius: 3,
        lineWidth: 2,
    });
});

playButton.addEventListener('click', () => {
    setPlaying(!playing);
});

resetButton.addEventListener('click', () => {
    restart();
    stage.renderOnce();
});

themeSelect.addEventListener('change', () => {
    const value = themeSelect.value;

    if (!isThemeMode(value)) {
        return;
    }

    if (value === 'system') {
        applyTheme(systemTheme());
    } else {
        setTheme(value);
    }
});

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.addEventListener('click', () => {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
        themeSelect.value = getTheme();
    });
}

window.addEventListener('pagehide', () => {
    setPlaying(false);
    stage.destroy();
});

defineShellElement();
setPlaying(true);
