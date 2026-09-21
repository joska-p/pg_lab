import { PALETTE_REGISTRY, type PalettePreset, type PalettePresetName } from '../palettes/registry';
import { applyMood } from './apply-mood';
import type { Mood } from './moods';
import type { SeededRandom } from './seeded-random';

export function pickPalette(
    rng: SeededRandom,
    mood: Mood,
    selectedPalette?: PalettePresetName,
): PalettePreset {
    if (selectedPalette) {
        return PALETTE_REGISTRY.find((p) => p.name === selectedPalette) ?? PALETTE_REGISTRY[0];
    }

    return rng.pickWeighted(applyMood(PALETTE_REGISTRY, mood.paletteWeights));
}
