import { drawFourierEpicycles } from '../../modules/fourier/drawFourierEpicycles';
import type { VisualLayer } from '../types';
import { drawBarChart } from './drawBarChart';
import { drawBaseline } from './drawBaseline';
import { drawConnectionLines } from './drawConnectionLines';
import { drawFactorWaves } from './drawFactorWaves';
import { drawMountain } from './drawMountain';
import { drawPlottedNumbers } from './drawPlottedNumbers';
import { drawRadialSpokes } from './drawRadialSpokes';
import { drawRecamanArcs } from './drawRecamanArcs';
import { drawStemPlot } from './drawStemPlot';

const layers: VisualLayer[] = [
    drawBaseline,
    drawPlottedNumbers,
    drawFactorWaves,
    drawRecamanArcs,
    drawConnectionLines,
    drawRadialSpokes,
    drawMountain,
    drawBarChart,
    drawStemPlot,
    drawFourierEpicycles,
];

const layerMap = new Map<string, VisualLayer>(layers.map((layer) => [layer.id, layer]));

function getAllLayers(): VisualLayer[] {
    return layers;
}

function getLayer(id: string): VisualLayer | undefined {
    return layerMap.get(id);
}

export { getAllLayers, getLayer };
