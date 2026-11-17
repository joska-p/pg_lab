import './styles.css';
import { createSlider, createTextArea } from '../../../ui/controls';
import { initArtPage, required } from '../page';
import { SYLLABIC_FIBONACCI_FRAGMENT } from './shader/SyllabicFibonacciMaterial';

const DEFAULT_SEED = 'indigenous-geometry-2026';
const PHRASES = [
    'cree-geometry-pulse',
    'ojibwe-pisano-grid',
    'inuktitut-vowel-rot',
    'aboriginal-glyph-wave',
    'modulo-digital-artifact',
    'cosmic-mathematics-flow',
] as const;

let seed = DEFAULT_SEED;
let modulo = 4;
let complexity = 25;

function seedOffset(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index++) {
        hash = value.charCodeAt(index) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 1000);
}

const stage = initArtPage({
    fragment: SYLLABIC_FIBONACCI_FRAGMENT,
    uniforms: () => ({
        uGridSize: complexity,
        uModulo: modulo,
        uSymbolType: 0,
        uPalette: 0,
        uGlitch: 0.15,
        uSeedOffset: seedOffset(seed),
    }),
});

const seedArea = createTextArea(required<HTMLElement>('[data-control="seed"]'), seed);
const moduloSlider = createSlider(required<HTMLElement>('[data-control="modulo"]'), {
    min: 2,
    max: 16,
    step: 1,
    value: modulo,
});
const complexitySlider = createSlider(required<HTMLElement>('[data-control="complexity"]'), {
    min: 5,
    max: 45,
    step: 1,
    value: complexity,
});
const randomSeed = required<HTMLButtonElement>('[data-random-seed]');

seedArea.addEventListener('change', () => {
    seed = seedArea.value;
    stage?.renderOnce();
});
moduloSlider.addEventListener('input', () => {
    modulo = Number(moduloSlider.value);
    stage?.renderOnce();
});
complexitySlider.addEventListener('input', () => {
    complexity = Number(complexitySlider.value);
    stage?.renderOnce();
});
randomSeed.addEventListener('click', () => {
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)] ?? PHRASES[0];
    seed = `${phrase}-${Math.floor(Math.random() * 1000)}`;
    seedArea.value = seed;
    stage?.renderOnce();
});
