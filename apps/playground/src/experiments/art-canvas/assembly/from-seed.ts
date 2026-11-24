import type { PalettePresetName } from '../palettes/registry';
import type { MoodName } from './moods';
import { pickEffects } from './pick-effects';
import { pickModules } from './pick-modules';
import { effectiveComplexity, pickMood } from './pick-mood';
import { pickPalette } from './pick-palette';
import { pickTemplate } from './pick-template';
import { resolveDeps } from './resolve-deps';
import { createSeededRandom } from './seeded-random';

export function generateShaderFromSeed(
    seed: string,
    complexity = 3,
    selectedMood?: MoodName,
    selectedPalette?: PalettePresetName,
): string {
    const rng = createSeededRandom(seed);
    const mood = pickMood(rng, selectedMood);
    const effComplexity = effectiveComplexity(complexity, mood);
    const pickedTemplate = pickTemplate(rng, mood);
    const { activeModules, spaceBlock, shapeBlock } = pickModules(rng, mood, effComplexity);
    const { effectBlock, effectModules } = pickEffects(rng, mood);
    const uniqueInjectedCode = resolveDeps(pickedTemplate, [...activeModules, ...effectModules]);
    const palette = pickPalette(rng, mood, selectedPalette);

    return pickedTemplate.generate({
        complexity: effComplexity,
        rng,
        spaceBlock,
        shapeBlock,
        effectBlock,
        palette,
        uniqueInjectedCode,
    });
}
