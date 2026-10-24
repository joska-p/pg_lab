import { create } from 'zustand';

import type { OutputType, WorkflowStep } from './types';

interface ManipulatorState {
    imageSource: OutputType | null;
    outputs: OutputType[];
    isProcessing: boolean;
    workflow: WorkflowStep[];
}

const manipulatorStore = create<ManipulatorState>(() => ({
    imageSource: null,
    outputs: [],
    isProcessing: false,
    workflow: [],
}));

export { manipulatorStore };
