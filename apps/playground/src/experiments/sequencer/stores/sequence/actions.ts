import { generateSequence } from '../../engine/engine';
import type { SequenceRule } from '../../engine/rules/types';
import { sequenceStore } from './store';

function clampSteps(steps: number, maxSteps: number): number {
    return Math.min(Math.max(steps, 2), maxSteps);
}

function regenerateSequence(sequenceRule: SequenceRule, steps: number, seed?: string): number[] {
    return generateSequence({ sequenceRule, steps, ...(seed && { seed }) });
}

export function setSequenceRule({ sequenceRule }: { sequenceRule: SequenceRule }) {
    const currentSteps = sequenceStore.getState().steps;
    const currentSeed = sequenceStore.getState().seed;

    const clampedSteps = clampSteps(currentSteps, sequenceRule.maxSteps);

    sequenceStore.setState({
        sequenceRule,
        steps: clampedSteps,
        sequence: regenerateSequence(sequenceRule, clampedSteps, currentSeed),
    });
}

export function setSequenceSteps({ steps }: { steps: number }) {
    const state = sequenceStore.getState();
    const currentSeed = state.seed;
    const clampedSteps = clampSteps(steps, state.sequenceRule.maxSteps);

    sequenceStore.setState({
        steps: clampedSteps,
        sequence: regenerateSequence(state.sequenceRule, clampedSteps, currentSeed),
    });
}

export function setSeed(seed: string) {
    const state = sequenceStore.getState();

    sequenceStore.setState({
        seed,
        sequence: regenerateSequence(state.sequenceRule, state.steps, seed),
    });
}
