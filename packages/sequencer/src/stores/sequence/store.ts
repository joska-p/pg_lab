import { create } from 'zustand';

import { generateSequence } from '../../engine/engine';
import { recamanRule } from '../../engine/rules/recaman';
import type { SequenceState } from './types';

const sequenceStore = create<SequenceState>(() => {
    return {
        sequenceRule: recamanRule,
        steps: 2,
        seed: 'random seed',
        sequence: generateSequence({ sequenceRule: recamanRule, steps: 2 }),
    };
});

export { sequenceStore };
