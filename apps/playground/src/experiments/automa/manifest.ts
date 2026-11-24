import type { ExperimentMetadata } from '../../shell/types';

export const experiment = {
    label: 'Automa',
    summary:
        'GPU-driven cellular automaton grid with live drawing brushes and switchable evolution rules.',
    tint: 'solder',
    mark: 'automa',
    panelTitle: 'Automa Controls',
    stageLabel: 'automa',
} satisfies ExperimentMetadata;
