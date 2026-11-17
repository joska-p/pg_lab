import './styles.css';
import { createSlider } from '../../../ui/controls';
import { initArtPage, required } from '../page';
import fragment from './shader/spiraleFragment.glsl?raw';

let gap = 0.05;

const stage = initArtPage({
    fragment,
    uniforms: () => ({ u_gap: gap }),
});

const slider = createSlider(required<HTMLElement>('[data-control="gap"]'), {
    min: 0.01,
    max: 0.5,
    step: 0.01,
    value: gap,
});

slider.addEventListener('input', () => {
    gap = Number(slider.value);
    stage?.renderOnce();
});
