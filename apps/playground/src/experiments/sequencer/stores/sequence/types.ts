import type { SequenceRule } from '../../engine/rules/types';

interface SequenceState {
    sequenceRule: SequenceRule;
    steps: number;
    seed: string;
    sequence: number[];
}

export type { SequenceState };
