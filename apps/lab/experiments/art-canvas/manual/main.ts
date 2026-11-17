import './styles.css';
import { createSlider } from '../../../ui/controls';
import { initArtPage, required } from '../page';
import { manual } from './shader/manual';

let divisions = 5;
let chroma = 0.15;
let lightness = 0.7;

const stage = initArtPage({
    fragment: manual.fragmentShader,
    uniforms: () => ({ uDivisions: divisions, uChroma: chroma, uLightness: lightness }),
    autoplay: false,
});

const divisionSlider = createSlider(required<HTMLElement>('[data-control="divisions"]'), {
    min: 1,
    max: 100,
    step: 1,
    value: divisions,
});
const chromaSlider = createSlider(required<HTMLElement>('[data-control="chroma"]'), {
    min: 0,
    max: 0.4,
    step: 0.01,
    value: chroma,
});
const lightnessSlider = createSlider(required<HTMLElement>('[data-control="lightness"]'), {
    min: 0,
    max: 1,
    step: 0.1,
    value: lightness,
});

divisionSlider.addEventListener('input', () => {
    divisions = Number(divisionSlider.value);
    stage?.renderOnce();
});
chromaSlider.addEventListener('input', () => {
    chroma = Number(chromaSlider.value);
    stage?.renderOnce();
});
lightnessSlider.addEventListener('input', () => {
    lightness = Number(lightnessSlider.value);
    stage?.renderOnce();
});
