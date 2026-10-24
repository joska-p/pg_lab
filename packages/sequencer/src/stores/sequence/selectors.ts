import { sequenceStore } from './store';

function useSeed() {
    return sequenceStore((s) => s.seed);
}

function useSequenceRule() {
    return sequenceStore((s) => s.sequenceRule);
}

function useSequenceSequence() {
    return sequenceStore((s) => s.sequence);
}

function useSequenceSteps() {
    return sequenceStore((s) => s.steps);
}

export { useSeed, useSequenceRule, useSequenceSequence, useSequenceSteps };
