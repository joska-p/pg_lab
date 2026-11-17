/*
 * Nearest-neighbour classification over the two extracted features.
 * Pure module: no DOM, no state, no imports outside the copied dataset/types.
 */

import { features } from '../data/dataset/ts_objects/features';
import type { FeatureSample, Label, Point } from './types';

export interface Neighbour {
    readonly sample: FeatureSample;
    readonly distance: number;
}

export interface Prediction {
    readonly label: Label;
    readonly neighbours: Neighbour[];
}

const samples: readonly FeatureSample[] = features.samples;
const pathExtent = Math.max(1, ...samples.map((sample) => sample.point[0]));
const pointExtent = Math.max(1, ...samples.map((sample) => sample.point[1]));

/** Feature-wise normalisation keeps the path count from being drowned by the point count. */
function distance(a: Point, b: Point): number {
    const dx = (a[0] - b[0]) / pathExtent;
    const dy = (a[1] - b[1]) / pointExtent;

    return Math.hypot(dx, dy);
}

export function nearestNeighbours(point: Point, count: number): Neighbour[] {
    const ranked = samples.map((sample) => ({
        sample,
        distance: distance(point, sample.point),
    }));

    ranked.sort((a, b) => a.distance - b.distance || a.sample.id - b.sample.id);

    return ranked.slice(0, Math.max(1, Math.min(Math.trunc(count), ranked.length)));
}

/** Distance-weighted vote across the neighbours, with a deterministic tie-break. */
export function classify(point: Point, count = 3): Prediction {
    const neighbours = nearestNeighbours(point, count);
    const scores = new Map<Label, number>();

    for (const neighbour of neighbours) {
        const weight = 1 / (neighbour.distance + 1e-6);

        scores.set(neighbour.sample.label, (scores.get(neighbour.sample.label) ?? 0) + weight);
    }

    let label: Label = neighbours[0]?.sample.label ?? 'car';
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const [candidate, score] of scores) {
        if (score > bestScore) {
            label = candidate;
            bestScore = score;
        }
    }

    return { label, neighbours };
}
