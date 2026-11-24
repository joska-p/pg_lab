import type { ExperimentMetadata } from '../../shell/types';

export const experiment = {
    label: 'Sequencer',
    summary:
        'Polyphonic multi-track step sequencer and audio synthesizer engine running on the Web Audio API.',
    tint: 'orange',
    mark: 'sequencer',
    stageLabel: 'Sequencer',
} satisfies ExperimentMetadata;
