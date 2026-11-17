import './styles.css';
import { createSelect, createSlider, createTextInput } from '../../../ui/controls';
import { initArtPage, required } from '../page';
import { generateShaderFromSeed } from './core/assembly/from-seed';
import type { MoodName } from './core/assembly/moods';
import type { PalettePresetName } from './core/palettes/registry';

const MOODS = [
    { value: 'organic', label: 'Organic' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'calm', label: 'Calm' },
    { value: 'energetic', label: 'Energetic' },
] as const satisfies readonly { value: MoodName; label: string }[];

const PALETTES = [
    { value: 'iridescent_opal', label: 'Iridescent Opal' },
    { value: 'neon_cyber', label: 'Neon Cyber' },
    { value: 'biomorphic_flesh', label: 'Biomorphic Flesh' },
    { value: 'volcanic_magma', label: 'Volcanic Magma' },
    { value: 'deep_ocean', label: 'Deep Ocean' },
] as const satisfies readonly { value: PalettePresetName; label: string }[];

let seed = 'random seed';
let complexity = 3;
let mood: MoodName = 'organic';
let palette: PalettePresetName = 'iridescent_opal';

const stage = initArtPage({
    fragment: generateShaderFromSeed(seed, complexity, mood, palette),
});

const seedInput = createTextInput(required<HTMLElement>('[data-control="seed"]'), seed);
const complexitySlider = createSlider(required<HTMLElement>('[data-control="complexity"]'), {
    min: 1,
    max: 5,
    step: 1,
    value: complexity,
});
const moodSelect = createSelect(required<HTMLElement>('[data-control="mood"]'), MOODS, mood);
const paletteSelect = createSelect(
    required<HTMLElement>('[data-control="palette"]'),
    PALETTES,
    palette,
);

function isMood(value: string): value is MoodName {
    return MOODS.some((option) => option.value === value);
}

function isPalette(value: string): value is PalettePresetName {
    return PALETTES.some((option) => option.value === value);
}

function refresh(): void {
    if (!stage) {
        return;
    }

    stage.setFragment(generateShaderFromSeed(seed, complexity, mood, palette));
}

seedInput.addEventListener('change', () => {
    seed = seedInput.value;
    refresh();
});
complexitySlider.addEventListener('input', () => {
    complexity = Number(complexitySlider.value);
    refresh();
});
moodSelect.addEventListener('change', () => {
    const value = moodSelect.value;
    if (isMood(value)) {
        mood = value;
        refresh();
    }
});
paletteSelect.addEventListener('change', () => {
    const value = paletteSelect.value;
    if (isPalette(value)) {
        palette = value;
        refresh();
    }
});
