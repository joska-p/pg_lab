import type { ColorNames } from '@repo/ui/tokens/tint.stylex';

export interface ExperimentItem {
    readonly id: string;
    readonly label: string;
    readonly path: string;
    readonly tint: ColorNames;
    readonly tags: readonly string[];
    readonly summary: string;
    readonly isHome?: boolean;
}

export const EXPERIMENT_ITEMS: readonly ExperimentItem[] = [
    {
        id: 'home',
        label: 'Home',
        path: '/',
        tint: 'neutral',
        tags: ['workbench', 'overview', 'catalog'],
        summary:
            'Central creative coding workbench and exploration gallery for 14 procedural art, mathematics, and audio systems.',
        isHome: true,
    },
    {
        id: 'art-canvas',
        label: 'Art Canvas',
        path: '/art-canvas',
        tint: 'aurora',
        tags: ['webgl', 'glsl', 'shaders', 'raymarching'],
        summary:
            'GPU shader workshop container with live fragment compilation and parametric raymarching.',
    },
    {
        id: 'mosaic-maker',
        label: 'Mosaic Maker',
        path: '/mosaic-maker',
        tint: 'solder',
        tags: ['procedural', 'svg', 'css-vars', 'tessellation'],
        summary:
            'Procedural geometric mosaic patterns generated with modular SVG tiles and dynamic CSS variables.',
    },
    {
        id: 'mol-demo',
        label: 'Mol Demo',
        path: '/mol-demo',
        tint: 'aqua',
        tags: ['3d-webgl', 'physics', 'scattering', 'crystallography'],
        summary:
            'Interactive 3D molecular lattice simulator paired with real-time X-ray scattering diffraction.',
    },
    {
        id: 'automa',
        label: 'Automa',
        path: '/automa',
        tint: 'solder',
        tags: ['cellular-automata', 'gpu-grid', 'life', 'emergence'],
        summary:
            'GPU-driven cellular automaton grid with live drawing brushes and switchable evolution rules.',
    },
    {
        id: 'fracture',
        label: 'Fracture',
        path: '/fracture',
        tint: 'purple',
        tags: ['fractals', 'mandelbrot', 'julia', 'perturbation'],
        summary:
            'Extreme-depth fractal explorer using double-split precision and perturbation mathematics.',
    },
    {
        id: 'radu-machine-learning',
        label: 'Radu Machine Learning',
        path: '/radu-machine-learning',
        tint: 'amber',
        tags: ['neural-net', 'classification', 'knn', 'clustering'],
        summary:
            'Visual machine learning lab exploring neural networks, spatial clustering, and digit recognition.',
    },
    {
        id: 'randomart',
        label: 'Randomart',
        path: '/randomart',
        tint: 'orange',
        tags: ['grammar', 'genetic-art', 'glsl-synth', 'ast'],
        summary:
            'Generative art synthesis converting recursive mathematical ASTs into live GLSL fragment shaders.',
    },
    {
        id: 'oeis-signal',
        label: 'OEIS Signal',
        path: '/oeis-signal',
        tint: 'aqua',
        tags: ['integer-seq', 'oeis', 'fft', 'audio-signal'],
        summary:
            'Signal processing workbench translating On-Line Encyclopedia integer sequences into audio and waveforms.',
    },
    {
        id: 'palette',
        label: 'Palette Generator',
        path: '/palette',
        tint: 'aurora',
        tags: ['oklch', 'color-gamut', 'harmonics', 'workers'],
        summary:
            'Perceptual color palette designer and harmonic palette generator calculated in OKLCH space.',
    },
    {
        id: 'pixel',
        label: 'Pixel Docs',
        path: '/pixel',
        tint: 'purple',
        tags: ['pipeline', 'canvas-api', 'convolution', 'dither'],
        summary:
            'Interactive visual documentation and testbed for browser-based image transform pipelines.',
    },
    {
        id: 'pixel-manipulator',
        label: 'Pixel Manipulator',
        path: '/pixel-manipulator',
        tint: 'amber',
        tags: ['image-kernel', 'matrices', 'error-diffusion', 'filters'],
        summary:
            'Multi-pass image convolution laboratory featuring custom kernels, matrix filters, and dithering.',
    },
    {
        id: 'notebook',
        label: 'Notebook',
        path: '/notebook',
        tint: 'neutral',
        tags: ['markdown', 'reactive-log', 'scratchpad', 'research'],
        summary:
            'Creative coding notebook and research scratchpad for capturing algorithm notes and design ideas.',
    },
    {
        id: 'sequencer',
        label: 'Sequencer',
        path: '/sequencer',
        tint: 'orange',
        tags: ['web-audio', 'step-sequencer', 'polyphony', 'synth'],
        summary:
            'Polyphonic multi-track step sequencer and audio synthesizer engine running on the Web Audio API.',
    },
] as const;

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
