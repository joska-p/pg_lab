export interface ExperimentMetadata {
    readonly id: string;
    readonly label: string;
    readonly panelTitle: string;
    readonly stageLabel: string;
    readonly available: boolean;
}

// Keep the React registry's canonical order, but metadata only: the Solid
// catalogue owns no component loaders and decides availability per session.
export const experimentRegistry = [
    {
        id: 'home',
        label: 'Home',
        panelTitle: 'home',
        stageLabel: 'home',
        available: false,
    },
    {
        id: 'art-canvas',
        label: 'Art Canvas',
        panelTitle: 'art-canvas',
        stageLabel: 'art-canvas',
        available: false,
    },
    {
        id: 'mosaic-maker',
        label: 'Mosaic Maker',
        panelTitle: 'Mosaic Maker',
        stageLabel: 'Mosaic',
        available: false,
    },
    {
        id: 'mol-demo',
        label: 'Mol Demo',
        panelTitle: 'mol-demo',
        stageLabel: 'mol-demo',
        available: false,
    },
    {
        id: 'automa',
        label: 'Automa',
        panelTitle: 'automa controls',
        stageLabel: 'automa',
        available: false,
    },
    {
        id: 'fracture',
        label: 'Fracture',
        panelTitle: 'fracture',
        stageLabel: 'fracture',
        available: false,
    },
    {
        id: 'radu-machine-learning',
        label: 'radu-machine-learning',
        panelTitle: 'Radu machine learning',
        stageLabel: 'Radu machine learning',
        available: false,
    },
    {
        id: 'randomart',
        label: 'Randomart',
        panelTitle: 'randomart',
        stageLabel: 'randomart',
        available: false,
    },
    {
        id: 'oeis-signal',
        label: 'oeis-signal',
        panelTitle: 'oeis-signal',
        stageLabel: 'oeis-signal',
        available: false,
    },
    {
        id: 'palette',
        label: 'Palette generator',
        panelTitle: 'Palette generator',
        stageLabel: 'Palette generator',
        available: false,
    },
    {
        id: 'pixel',
        label: 'pixel',
        panelTitle: 'Pixel docs',
        stageLabel: 'Pixel docs',
        available: false,
    },
    {
        id: 'pixel-manipulator',
        label: 'pixel-manipulator',
        panelTitle: 'Pixel manipulator',
        stageLabel: 'Pixel manipulator',
        available: false,
    },
    {
        id: 'notebook',
        label: 'Notebook',
        panelTitle: 'notebook controls',
        stageLabel: 'notebook',
        available: false,
    },
    {
        id: 'sequencer',
        label: 'sequencer',
        panelTitle: 'Sequencer',
        stageLabel: 'Sequencer',
        available: false,
    },
    {
        id: 'squared',
        label: 'Squared',
        panelTitle: 'squared',
        stageLabel: 'smith-tutte',
        available: false,
    },
    {
        id: 'string-art',
        label: 'String Art',
        panelTitle: 'string-art controls',
        stageLabel: 'string-art',
        available: false,
    },
    {
        id: 'three-stage',
        label: 'Three Stage',
        panelTitle: 'three-stage controls',
        stageLabel: 'three-stage',
        available: false,
    },
    {
        id: 'brouillon',
        label: 'Brouillon',
        panelTitle: 'Laboratory Workbench Controls',
        stageLabel: 'Component Workbench Stage',
        available: false,
    },
] as const satisfies readonly ExperimentMetadata[];

export type ExperimentId = (typeof experimentRegistry)[number]['id'];
