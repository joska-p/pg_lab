import type { Step } from '@repo/pixel/processor';

type WorkflowPresetStep = Step;

interface WorkflowPreset {
    name: string;
    description: string;
    steps: WorkflowPresetStep[];
}

const WORKFLOW_PRESETS: WorkflowPreset[] = [
    {
        name: 'Vintage',
        description: 'Warm, faded sepia look',
        steps: [
            { id: 'sepia', options: {} },
            { id: 'brightness', options: { value: 1.2 } },
            { id: 'contrast', options: { value: 0.8 } },
        ],
    },
    {
        name: 'Dramatic B&W',
        description: 'High-contrast black and white',
        steps: [
            { id: 'grayscale', options: {} },
            { id: 'contrast', options: { value: 2.0 } },
        ],
    },
    {
        name: 'Neon',
        description: 'Bold oversaturated colors',
        steps: [
            { id: 'saturation', options: { value: 2.5 } },
            { id: 'brightness', options: { value: 1.2 } },
            { id: 'contrast', options: { value: 1.5 } },
        ],
    },
    {
        name: 'Blueprint',
        description: 'Inverted threshold mask',
        steps: [
            { id: 'invert', options: {} },
            { id: 'threshold', options: { threshold: 200 } },
        ],
    },
    {
        name: 'Soft Pastel',
        description: 'Muted, gentle tones',
        steps: [
            { id: 'saturation', options: { value: 1.1 } },
            { id: 'brightness', options: { value: 1.3 } },
            { id: 'contrast', options: { value: 0.7 } },
        ],
    },
    {
        name: 'Dark & Moody',
        description: 'Dark, rich atmosphere',
        steps: [
            { id: 'brightness', options: { value: 0.5 } },
            { id: 'contrast', options: { value: 1.8 } },
            { id: 'saturation', options: { value: 0.6 } },
        ],
    },
    {
        name: 'Overexposed',
        description: 'Bright, washed-out film look',
        steps: [
            { id: 'brightness', options: { value: 2.2 } },
            { id: 'contrast', options: { value: 0.5 } },
        ],
    },
    {
        name: 'High Contrast',
        description: 'Punchy, high-impact colors',
        steps: [
            { id: 'contrast', options: { value: 2.5 } },
            { id: 'saturation', options: { value: 1.6 } },
        ],
    },
];

export { WORKFLOW_PRESETS };
export type { WorkflowPreset, WorkflowPresetStep };
