import type { StageProps } from '@repo/ui/components/ExperimentShell';
import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import type { ComponentType } from 'react';

export interface SceneModule {
    Scene: ComponentType;
    stageProps?: StageProps;
}

export interface ControlsModule {
    Controls: ComponentType;
}

export interface Experiment<TId extends string = string> {
    readonly id: TId;
    readonly label: string;
    readonly panelTitle: string;
    readonly stageLabel: string;
    readonly tint: ColorNames;
    readonly tags: readonly string[];
    readonly summary: string;
    readonly isHome?: boolean;
    readonly mark: string;
    readonly loadScene: () => Promise<SceneModule>;
    readonly loadControls: () => Promise<ControlsModule>;
}

export const EXPERIMENTS = [
    {
        id: 'home',
        label: 'Home',
        panelTitle: 'Home Controls',
        stageLabel: 'home',
        tint: 'neutral',
        tags: ['workbench', 'overview', 'catalog'],
        summary:
            'Central creative coding workbench and exploration gallery for procedural art, mathematics, and audio systems.',
        isHome: true,
        mark: 'home',
        loadScene: () => import('./components/home/Scene'),
        loadControls: () => import('./components/home/Controls'),
    },
    {
        id: 'art-canvas',
        label: 'Art Canvas',
        panelTitle: 'Art Canvas',
        stageLabel: 'art-canvas',
        tint: 'aurora',
        tags: ['webgl', 'glsl', 'shaders', 'raymarching'],
        summary:
            'GPU shader workshop container with live fragment compilation and parametric raymarching.',
        mark: 'art-canvas',
        loadScene: () => import('@repo/art-canvas/Scene'),
        loadControls: () => import('@repo/art-canvas/Controls'),
    },
    {
        id: 'mosaic-maker',
        label: 'Mosaic Maker',
        panelTitle: 'Mosaic Maker',
        stageLabel: 'Mosaic',
        tint: 'solder',
        tags: ['procedural', 'svg', 'css-vars', 'tessellation'],
        summary:
            'Procedural geometric mosaic patterns generated with modular SVG tiles and dynamic CSS variables.',
        mark: 'mosaic-maker',
        loadScene: () => import('@repo/mosaic-maker/Scene'),
        loadControls: () => import('@repo/mosaic-maker/Controls'),
    },
    {
        id: 'mol-demo',
        label: 'Mol Demo',
        panelTitle: 'Mol Demo',
        stageLabel: 'mol-demo',
        tint: 'aqua',
        tags: ['3d-webgl', 'physics', 'scattering', 'crystallography'],
        summary:
            'Interactive 3D molecular lattice simulator paired with real-time X-ray scattering diffraction.',
        mark: 'mol-demo',
        loadScene: () => import('@repo/mol-demo/Scene'),
        loadControls: () => import('@repo/mol-demo/Controls'),
    },
    {
        id: 'automa',
        label: 'Automa',
        panelTitle: 'Automa Controls',
        stageLabel: 'automa',
        tint: 'solder',
        tags: ['cellular-automata', 'gpu-grid', 'life', 'emergence'],
        summary:
            'GPU-driven cellular automaton grid with live drawing brushes and switchable evolution rules.',
        mark: 'automa',
        loadScene: () => import('@repo/automa/Scene'),
        loadControls: () => import('@repo/automa/Controls'),
    },
    {
        id: 'fracture',
        label: 'Fracture',
        panelTitle: 'Fracture',
        stageLabel: 'fracture',
        tint: 'purple',
        tags: ['fractals', 'mandelbrot', 'julia', 'perturbation'],
        summary:
            'Extreme-depth fractal explorer using double-split precision and perturbation mathematics.',
        mark: 'fracture',
        loadScene: () => import('@repo/fracture/Scene'),
        loadControls: () => import('@repo/fracture/Controls'),
    },
    {
        id: 'radu-machine-learning',
        label: 'Radu Machine Learning',
        panelTitle: 'Radu Machine Learning',
        stageLabel: 'Radu machine learning',
        tint: 'amber',
        tags: ['neural-net', 'classification', 'knn', 'clustering'],
        summary:
            'Visual machine learning lab exploring neural networks, spatial clustering, and digit recognition.',
        mark: 'radu-machine-learning',
        loadScene: () => import('@repo/radu-machine-learning/Scene'),
        loadControls: () => import('@repo/radu-machine-learning/Controls'),
    },
    {
        id: 'randomart',
        label: 'Randomart',
        panelTitle: 'Randomart',
        stageLabel: 'randomart',
        tint: 'orange',
        tags: ['grammar', 'genetic-art', 'glsl-synth', 'ast'],
        summary:
            'Generative art synthesis converting recursive mathematical ASTs into live GLSL fragment shaders.',
        mark: 'randomart',
        loadScene: () => import('@repo/randomart-ui/Scene'),
        loadControls: () => import('@repo/randomart-ui/Controls'),
    },
    {
        id: 'oeis-signal',
        label: 'OEIS Signal',
        panelTitle: 'OEIS Signal',
        stageLabel: 'oeis-signal',
        tint: 'aqua',
        tags: ['integer-seq', 'oeis', 'fft', 'audio-signal'],
        summary:
            'Signal processing workbench translating On-Line Encyclopedia integer sequences into audio and waveforms.',
        mark: 'oeis-signal',
        loadScene: () => import('@repo/oeis-signal/Scene'),
        loadControls: () => import('@repo/oeis-signal/Controls'),
    },
    {
        id: 'palette',
        label: 'Palette Generator',
        panelTitle: 'Palette Generator',
        stageLabel: 'Palette generator',
        tint: 'aurora',
        tags: ['oklch', 'color-gamut', 'harmonics', 'workers'],
        summary:
            'Perceptual color palette designer and harmonic palette generator calculated in OKLCH space.',
        mark: 'palette',
        loadScene: () => import('@repo/palette/Scene'),
        loadControls: () => import('@repo/palette/Controls'),
    },
    {
        id: 'pixel',
        label: 'Pixel Docs',
        panelTitle: 'Pixel Docs',
        stageLabel: 'Pixel docs',
        tint: 'purple',
        tags: ['pipeline', 'canvas-api', 'convolution', 'dither'],
        summary:
            'Interactive visual documentation and testbed for browser-based image transform pipelines.',
        mark: 'pixel',
        loadScene: () => import('@repo/pixel/Scene'),
        loadControls: () => import('@repo/pixel/Controls'),
    },
    {
        id: 'pixel-manipulator',
        label: 'Pixel Manipulator',
        panelTitle: 'Pixel Manipulator',
        stageLabel: 'Pixel manipulator',
        tint: 'amber',
        tags: ['image-kernel', 'matrices', 'error-diffusion', 'filters'],
        summary:
            'Multi-pass image convolution laboratory featuring custom kernels, matrix filters, and dithering.',
        mark: 'pixel-manipulator',
        loadScene: () => import('@repo/pixel-manipulator/Scene'),
        loadControls: () => import('@repo/pixel-manipulator/Controls'),
    },
    {
        id: 'notebook',
        label: 'Notebook',
        panelTitle: 'Notebook Controls',
        stageLabel: 'notebook',
        tint: 'neutral',
        tags: ['markdown', 'reactive-log', 'scratchpad', 'research'],
        summary:
            'Creative coding notebook and research scratchpad for capturing algorithm notes and design ideas.',
        mark: 'notebook',
        loadScene: () => import('@repo/notebook/Scene'),
        loadControls: () => import('@repo/notebook/Controls'),
    },
    {
        id: 'sequencer',
        label: 'Sequencer',
        panelTitle: 'Sequencer',
        stageLabel: 'Sequencer',
        tint: 'orange',
        tags: ['web-audio', 'step-sequencer', 'polyphony', 'synth'],
        summary:
            'Polyphonic multi-track step sequencer and audio synthesizer engine running on the Web Audio API.',
        mark: 'sequencer',
        loadScene: () => import('@repo/sequencer/Scene'),
        loadControls: () => import('@repo/sequencer/Controls'),
    },
] as const satisfies readonly Experiment[];

// Derive the types directly from the registry.
export type ExperimentDefinition = (typeof EXPERIMENTS)[number];
export type ExperimentId = ExperimentDefinition['id'];

export const experimentCount = EXPERIMENTS.length;
export const interactiveExperiments = EXPERIMENTS.filter(
    (experiment: Experiment) => !experiment.isHome,
);

export const POPULAR_TAGS = [
    'webgl',
    'cellular-automata',
    'fractals',
    'web-audio',
    'neural-net',
    'oklch',
    'procedural',
    'image-kernel',
    'integer-seq',
] as const;

export function experimentPath(experiment: Experiment): string {
    return experiment.isHome ? '/' : `/${experiment.id}`;
}

export const experimentsById = new Map<string, ExperimentDefinition>(
    EXPERIMENTS.map((experiment): [ExperimentId, ExperimentDefinition] => [
        experiment.id,
        experiment,
    ]),
);

export function getExperiment(id: string | undefined): ExperimentDefinition {
    return experimentsById.get(id ?? '') ?? EXPERIMENTS[0];
}

// Select options share the registry's ordering and metadata.
export const experimentOptions = EXPERIMENTS.map(({ id, label }) => ({
    value: id,
    label,
}));

// Cache loaded modules to avoid repeating dynamic imports.
function cached<Key, Value>(
    cache: Map<Key, Promise<Value>>,
    key: Key,
    load: () => Promise<Value>,
): Promise<Value> {
    const hit = cache.get(key);

    if (hit) {
        return hit;
    }

    const promise = load();
    cache.set(key, promise);

    // Drop failures so ErrorBoundary Retry refetches instead of rethrowing.
    void promise.then(
        () => undefined,
        () => {
            cache.delete(key);
        },
    );

    return promise;
}

const sceneCache = new Map<ExperimentId, Promise<SceneModule>>();

const controlsCache = new Map<ExperimentId, Promise<ControlsModule>>();

export function loadScene(experiment: ExperimentDefinition): Promise<SceneModule> {
    return cached(sceneCache, experiment.id, experiment.loadScene);
}

export function loadControls(experiment: ExperimentDefinition): Promise<ControlsModule> {
    return cached(controlsCache, experiment.id, experiment.loadControls);
}
