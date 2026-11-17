/*
 * Radu machine learning: one static shell, one 2D sketchpad, one SVG chart and one SVG gallery.
 * All DOM nodes are created once. Module variables hold the sketch, selection and k; control
 * changes only patch attributes, text and element classes. The former state stores and React
 * components are replaced by plain functions.
 */

import type { CanvasSize } from '../../lib/surface/core/canvasSize';
import { CanvasStage } from '../../ui/canvas-stage';
import { createSelect } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';
import { raduImgUrlById } from './assets/raduImgUrls';
import { computeChartBounds, createScalers, getTicks } from './components/chart/chart-utils';
import { HEIGHT, MARGIN, WIDTH } from './components/chart/constants';
import type { ChartPoint } from './components/chart/types';
import { CURRENT_DRAWING_COLOR, labelToColorMap } from './constants';
import { getDrawingLabels, getPointCount, getSamplesByStudents } from './core/api';
import { classify } from './core/classify';
import type { Drawing, Path, Point } from './core/types';
import { features } from './data/dataset/ts_objects/features';

const SVG_NS = 'http://www.w3.org/2000/svg';
const K_CHOICES = [1, 3, 5] as const;
const MAX_NEIGHBOURS = Math.max(...K_CHOICES);

function required<T extends Element>(selector: string, root: ParentNode = document): T {
    const element = root.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Radu machine learning markup is incomplete: ${selector}`);
    }

    return element;
}

function svgElement<K extends keyof SVGElementTagNameMap>(
    tag: K,
    attributes: Record<string, string> = {},
): SVGElementTagNameMap[K] {
    const element = document.createElementNS(SVG_NS, tag);

    for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
    }

    return element;
}

const cleanups: (() => void)[] = [];

const gallery = required<HTMLElement>('[data-gallery]');
const galleryStatus = required<HTMLElement>('[data-gallery-status]');
const sketchCanvas = required<HTMLCanvasElement>('[data-sketchpad]');
const colorInput = required<HTMLInputElement>('[data-stroke-color]');
const sketchStatus = required<HTMLElement>('[data-sketch-status]');
const chartMount = required<HTMLElement>('[data-chart]');
const status = required<HTMLElement>('[data-status]');
const undoButton = required<HTMLButtonElement>('[data-undo]');
const clearButton = required<HTMLButtonElement>('[data-clear]');
const exportButton = required<HTMLButtonElement>('[data-export]');
const prediction = required<HTMLElement>('[data-prediction]');
const neighboursMount = required<HTMLElement>('[data-neighbours]');
const kMount = required<HTMLElement>('[data-control="k"]');

const students = getSamplesByStudents();
const { featureNames, samples } = features;
const columnCount = getDrawingLabels().length + 1;

const drawingById = new Map<number, Drawing>();
const chartPoints: ChartPoint[] = samples.map(({ id, label, point }) => ({
    drawingId: id,
    label,
    x: point[0],
    y: point[1],
}));
const pointById = new Map<number, ChartPoint>();

for (const student of Object.values(students)) {
    for (const drawing of student.drawings) {
        drawingById.set(drawing.id, drawing);
    }
}
for (const point of chartPoints) {
    if (point.drawingId !== null) {
        pointById.set(point.drawingId, point);
    }
}

const domain = computeChartBounds(chartPoints);
const { xScale, yScale } = createScalers(domain.xDomain, domain.yDomain, {
    width: WIDTH,
    height: HEIGHT,
    margin: MARGIN,
});
const xTicks = getTicks(domain.xDomain, 5);
const yTicks = getTicks(domain.yDomain, 5);

/* Module state: no store subscriptions, no reconciliation. */
let paths: Path[] = [];
let currentPath: Path = [];
let strokeColor = colorInput.value;
let k = 3;
let drawing = false;
let activePointerId: number | null = null;
let selectedDrawingId: number | null = null;
let hoveredPoint: ChartPoint | null = null;
let canvasStage: CanvasStage | null = null;
let currentCircle: SVGCircleElement | null = null;

const galleryCards = new Map<number, HTMLElement>();
const dotById = new Map<number, SVGCircleElement>();

interface NeighbourCard {
    readonly button: HTMLButtonElement;
    readonly image: HTMLImageElement;
    readonly caption: HTMLElement;
}

const neighbourCards: NeighbourCard[] = [];

const tooltip = svgElement('g', { class: 'pg-radu__tooltip', visibility: 'hidden' });
const tooltipFrame = svgElement('foreignObject', { x: '0', y: '0', width: '96', height: '64' });
const tooltipCard = document.createElement('div');
const tooltipLabel = document.createElement('strong');
const tooltipX = document.createElement('span');
const tooltipY = document.createElement('span');

tooltipCard.className = 'pg-radu__tooltip-card';
tooltipCard.append(tooltipLabel, tooltipX, tooltipY);
tooltipFrame.append(tooltipCard);
tooltip.append(tooltipFrame);

function setStatus(message: string): void {
    status.textContent = message;
}

function toCanvasPosition(event: PointerEvent): Point {
    const rect = sketchCanvas.getBoundingClientRect();
    const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    const y = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0;

    return [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))];
}

function strokePath(context: CanvasRenderingContext2D, size: CanvasSize, path: Path): void {
    if (path.length < 2) {
        return;
    }

    context.beginPath();
    path.forEach(([x, y], index) => {
        if (index === 0) {
            context.moveTo(x * size.width, y * size.height);
        } else {
            context.lineTo(x * size.width, y * size.height);
        }
    });
    context.stroke();
}

function drawSketchpad(context: CanvasRenderingContext2D, size: CanvasSize): void {
    context.clearRect(0, 0, size.width, size.height);
    context.lineWidth = 2;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = strokeColor;

    for (const path of paths) {
        strokePath(context, size, path);
    }
    strokePath(context, size, currentPath);
}

function renderSketchpad(): void {
    const stage = canvasStage;

    if (stage) {
        drawSketchpad(stage.context, stage.size);
    }
}

function updateTooltip(): void {
    const point =
        hoveredPoint ??
        (selectedDrawingId === null ? null : (pointById.get(selectedDrawingId) ?? null));

    if (!point) {
        tooltip.setAttribute('visibility', 'hidden');
        return;
    }

    const x = xScale(point.x);
    const y = yScale(point.y);

    tooltip.setAttribute('x', String(Math.min(WIDTH - 96, Math.max(0, x - 40))));
    tooltip.setAttribute('y', String(Math.min(HEIGHT - 64, Math.max(0, y - 70))));
    tooltip.setAttribute('visibility', 'visible');
    tooltipLabel.textContent = point.label;
    tooltipX.textContent = `x: ${point.x.toFixed()}`;
    tooltipY.textContent = `y: ${point.y.toFixed()}`;
}

function refreshPrediction(point: Point): void {
    const result = classify(point, k);

    prediction.textContent = `Prediction: ${result.label}`;
    prediction.style.color = labelToColorMap[result.label];

    neighbourCards.forEach((card, index) => {
        const neighbour = result.neighbours[index];

        if (!neighbour) {
            card.button.hidden = true;
            return;
        }

        card.button.hidden = false;
        card.button.dataset.drawingId = String(neighbour.sample.id);
        card.image.src = raduImgUrlById[neighbour.sample.id] ?? '';
        card.image.alt = neighbour.sample.label;
        card.caption.textContent = `#${String(neighbour.sample.id)} · ${neighbour.distance.toFixed(3)}`;
    });
}

function refreshDerived(): void {
    const pathCount = paths.length;
    const pointCount = getPointCount(paths);

    sketchStatus.textContent = `Paths: ${String(pathCount)} · Points: ${String(pointCount)}`;

    if (currentCircle) {
        currentCircle.setAttribute('cx', String(xScale(pathCount)));
        currentCircle.setAttribute('cy', String(yScale(pointCount)));
        currentCircle.setAttribute('visibility', pointCount > 0 ? 'visible' : 'hidden');
    }

    if (pointCount > 0) {
        refreshPrediction([pathCount, pointCount]);
    } else {
        prediction.textContent = 'Prediction: —';
        prediction.style.color = '';
        for (const card of neighbourCards) {
            card.button.hidden = true;
        }
    }

    updateTooltip();
}

function beginStroke(event: PointerEvent): void {
    const stage = canvasStage;

    if (event.button !== 0 || !stage || activePointerId !== null) {
        return;
    }

    event.preventDefault();
    sketchCanvas.setPointerCapture(event.pointerId);
    activePointerId = event.pointerId;
    drawing = true;
    currentPath = [toCanvasPosition(event)];
    renderSketchpad();
}

function extendStroke(event: PointerEvent): void {
    if (!drawing || event.pointerId !== activePointerId) {
        return;
    }

    const point = toCanvasPosition(event);
    const last = currentPath[currentPath.length - 1];

    if (last && Math.hypot(point[0] - last[0], point[1] - last[1]) < 0.002) {
        return;
    }

    currentPath.push(point);
    renderSketchpad();
}

function endStroke(event: PointerEvent, commit: boolean): void {
    if (!drawing || event.pointerId !== activePointerId) {
        return;
    }

    drawing = false;
    activePointerId = null;

    if (sketchCanvas.hasPointerCapture(event.pointerId)) {
        sketchCanvas.releasePointerCapture(event.pointerId);
    }

    if (commit && currentPath.length > 0) {
        paths = [...paths, currentPath];
    }
    currentPath = [];

    renderSketchpad();
    refreshDerived();
}

function exportPaths(): void {
    if (paths.length === 0) {
        setStatus('Nothing to export: the sketchpad is empty.');
        return;
    }

    const url = URL.createObjectURL(
        new Blob([JSON.stringify(paths)], { type: 'application/json' }),
    );
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'paths.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(`Exported ${String(paths.length)} paths.`);
}

function setSelectedDrawingId(id: number | null): void {
    selectedDrawingId = id;

    for (const [drawingId, card] of galleryCards) {
        card.classList.toggle('is-selected', drawingId === id);
    }
    for (const [drawingId, dot] of dotById) {
        dot.classList.toggle('is-selected', drawingId === id);
    }

    const drawing = id === null ? undefined : drawingById.get(id);

    galleryStatus.textContent =
        drawing === undefined
            ? `${String(chartPoints.length)} drawings loaded.`
            : `Selected #${String(drawing.id)} — ${drawing.label}`;
    updateTooltip();
}

function focusDrawing(id: number): void {
    setSelectedDrawingId(id);
    galleryCards
        .get(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
}

function buildGallery(): void {
    for (const student of Object.values(students)) {
        const row = document.createElement('div');

        row.className = 'pg-radu__row';
        row.style.gridTemplateColumns = `repeat(${String(columnCount)}, minmax(0, 1fr))`;

        const name = document.createElement('h3');

        name.className = 'pg-radu__student';
        name.textContent = student.name;
        row.append(name);

        for (const drawing of student.drawings) {
            const card = document.createElement('div');

            card.className = 'pg-radu__card';
            card.dataset.drawingId = String(drawing.id);
            card.dataset.label = drawing.label;
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `${drawing.label} by ${student.name}`);

            const image = document.createElement('img');

            image.className = 'pg-radu__image';
            image.src = raduImgUrlById[drawing.id] ?? '';
            image.alt = drawing.label;
            image.loading = 'lazy';
            card.append(image);

            const selectCard = (): void => setSelectedDrawingId(drawing.id);
            const handleCardKey = (event: KeyboardEvent): void => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectCard();
                }
            };

            card.addEventListener('click', selectCard);
            card.addEventListener('keydown', handleCardKey);
            cleanups.push(() => {
                card.removeEventListener('click', selectCard);
                card.removeEventListener('keydown', handleCardKey);
            });

            row.append(card);
            galleryCards.set(drawing.id, card);
        }

        gallery.append(row);
    }
}

function createXAxis(): SVGGElement {
    const group = svgElement('g', { class: 'pg-radu__axis' });
    const baseline = svgElement('line', {
        x1: String(MARGIN.left),
        y1: String(HEIGHT - MARGIN.bottom),
        x2: String(WIDTH - MARGIN.right),
        y2: String(HEIGHT - MARGIN.bottom),
        stroke: 'currentColor',
    });

    group.append(baseline);

    for (const tick of xTicks) {
        const position = xScale(tick);

        group.append(
            svgElement('line', {
                x1: String(position),
                y1: String(HEIGHT - MARGIN.bottom),
                x2: String(position),
                y2: String(HEIGHT - MARGIN.bottom + 5),
                stroke: 'currentColor',
            }),
        );

        const text = svgElement('text', {
            x: String(position),
            y: String(HEIGHT - MARGIN.bottom + 8),
            'text-anchor': 'middle',
            'dominant-baseline': 'hanging',
            'font-size': '12',
            fill: 'currentColor',
        });

        text.textContent = tick.toFixed(1);
        group.append(text);
    }

    const title = svgElement('text', {
        x: String(WIDTH - MARGIN.right),
        y: String(HEIGHT - MARGIN.bottom + 32),
        'text-anchor': 'end',
        'font-size': '12',
        fill: 'currentColor',
        'font-weight': '500',
    });

    title.textContent = featureNames[0];
    group.append(title);

    return group;
}

function createYAxis(): SVGGElement {
    const group = svgElement('g', { class: 'pg-radu__axis' });
    const baseline = svgElement('line', {
        x1: String(MARGIN.left),
        y1: String(MARGIN.top),
        x2: String(MARGIN.left),
        y2: String(HEIGHT - MARGIN.bottom),
        stroke: 'currentColor',
    });

    group.append(baseline);

    for (const tick of yTicks) {
        const position = yScale(tick);

        group.append(
            svgElement('line', {
                x1: String(MARGIN.left - 5),
                y1: String(position),
                x2: String(MARGIN.left),
                y2: String(position),
                stroke: 'currentColor',
            }),
        );

        const text = svgElement('text', {
            x: String(MARGIN.left - 8),
            y: String(position),
            'text-anchor': 'end',
            'dominant-baseline': 'middle',
            'font-size': '12',
            fill: 'currentColor',
        });

        text.textContent = tick.toFixed(1);
        group.append(text);
    }

    const title = svgElement('text', {
        x: String(MARGIN.left),
        y: String(MARGIN.top - 12),
        'text-anchor': 'start',
        'font-size': '12',
        fill: 'currentColor',
        'font-weight': '500',
    });

    title.textContent = featureNames[1];
    group.append(title);

    return group;
}

function createDot(point: ChartPoint): SVGCircleElement {
    const circle = svgElement('circle', {
        cx: String(xScale(point.x)),
        cy: String(yScale(point.y)),
        r: '4',
        fill: point.label === 'current' ? CURRENT_DRAWING_COLOR : labelToColorMap[point.label],
    });

    const handleEnter = (): void => {
        hoveredPoint = point;
        updateTooltip();
    };
    const handleLeave = (): void => {
        hoveredPoint = null;
        updateTooltip();
    };
    const handleClick = (): void => {
        if (point.drawingId !== null) {
            focusDrawing(point.drawingId);
        }
    };

    circle.addEventListener('pointerenter', handleEnter);
    circle.addEventListener('pointerleave', handleLeave);
    circle.addEventListener('click', handleClick);
    cleanups.push(() => {
        circle.removeEventListener('pointerenter', handleEnter);
        circle.removeEventListener('pointerleave', handleLeave);
        circle.removeEventListener('click', handleClick);
    });

    return circle;
}

function buildChart(): void {
    const svg = svgElement('svg', {
        viewBox: `0 0 ${String(WIDTH)} ${String(HEIGHT)}`,
        preserveAspectRatio: 'xMidYMid meet',
        role: 'img',
        'aria-label': 'Path count against point count for the 320 sketches',
    });

    svg.classList.add('pg-radu__chart-svg');
    svg.append(createXAxis(), createYAxis());

    for (const point of chartPoints) {
        const circle = createDot(point);
        const id = point.drawingId;

        circle.classList.add('pg-radu__dot');
        circle.dataset.drawingIdPoint = String(id);
        svg.append(circle);

        if (id !== null) {
            dotById.set(id, circle);
        }
    }

    currentCircle = createDot({ drawingId: null, label: 'current', x: 0, y: 0 });
    currentCircle.classList.add('pg-radu__dot', 'pg-radu__dot--current');
    currentCircle.setAttribute('visibility', 'hidden');
    svg.append(currentCircle, tooltip);
    chartMount.append(svg);
}

function buildNeighbourCards(): void {
    for (let index = 0; index < MAX_NEIGHBOURS; index += 1) {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'pg-radu__neighbour';
        button.hidden = true;

        const image = document.createElement('img');

        image.className = 'pg-radu__neighbour-image';
        image.alt = '';
        image.loading = 'lazy';

        const caption = document.createElement('span');

        caption.className = 'pg-radu__neighbour-caption';
        button.append(image, caption);

        const selectNeighbour = (): void => {
            const id = button.dataset.drawingId;

            if (id !== undefined) {
                focusDrawing(Number(id));
            }
        };

        button.addEventListener('click', selectNeighbour);
        cleanups.push(() => button.removeEventListener('click', selectNeighbour));

        neighboursMount.append(button);
        neighbourCards.push({ button, image, caption });
    }
}

buildGallery();
buildChart();
buildNeighbourCards();

const kSelect = createSelect(
    kMount,
    K_CHOICES.map((value) => ({ value: String(value), label: String(value) })),
    String(k),
);

const handleKChange = (): void => {
    const value = Number(kSelect.value);

    if (!K_CHOICES.some((choice) => choice === value)) {
        return;
    }

    k = value;
    refreshDerived();
};
const handleColorInput = (): void => {
    strokeColor = colorInput.value;
    renderSketchpad();
};
const handleUndo = (): void => {
    paths = paths.slice(0, -1);
    renderSketchpad();
    refreshDerived();
};
const handleClear = (): void => {
    paths = [];
    currentPath = [];
    drawing = false;
    activePointerId = null;
    renderSketchpad();
    refreshDerived();
};
const handlePointerUp = (event: PointerEvent): void => endStroke(event, true);
const handlePointerCancel = (event: PointerEvent): void => endStroke(event, false);

kSelect.addEventListener('change', handleKChange);
colorInput.addEventListener('input', handleColorInput);
undoButton.addEventListener('click', handleUndo);
clearButton.addEventListener('click', handleClear);
exportButton.addEventListener('click', exportPaths);
sketchCanvas.addEventListener('pointerdown', beginStroke);
sketchCanvas.addEventListener('pointermove', extendStroke);
sketchCanvas.addEventListener('pointerup', handlePointerUp);
sketchCanvas.addEventListener('pointercancel', handlePointerCancel);

cleanups.push(() => {
    kSelect.removeEventListener('change', handleKChange);
    colorInput.removeEventListener('input', handleColorInput);
    undoButton.removeEventListener('click', handleUndo);
    clearButton.removeEventListener('click', handleClear);
    exportButton.removeEventListener('click', exportPaths);
    sketchCanvas.removeEventListener('pointerdown', beginStroke);
    sketchCanvas.removeEventListener('pointermove', extendStroke);
    sketchCanvas.removeEventListener('pointerup', handlePointerUp);
    sketchCanvas.removeEventListener('pointercancel', handlePointerCancel);
});

canvasStage = new CanvasStage(sketchCanvas, { onResize: renderSketchpad });
renderSketchpad();
refreshDerived();
setSelectedDrawingId(null);
defineShellElement();
initTheme();

window.addEventListener(
    'pagehide',
    () => {
        for (const cleanup of cleanups) {
            cleanup();
        }
        cleanups.length = 0;
        canvasStage?.destroy();
        canvasStage = null;
    },
    { once: true },
);
