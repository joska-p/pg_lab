import type { ShaderModule } from '../shaders/types';
import { applyMood } from './apply-mood';
import type { Mood } from './moods';
import { processArgs } from './process-args';
import { EFFECT_REGISTRY } from './registries';
import type { SeededRandom } from './seeded-random';

export function pickEffects(
    rng: SeededRandom,
    mood: Mood,
): { effectBlock: string; effectModules: ShaderModule[] } {
    const effectModules: ShaderModule[] = [];

    if (rng.next() < 0.4) {
        const moodRegistry = applyMood(EFFECT_REGISTRY, mood.moduleWeights);
        const effect = rng.pickWeighted(moodRegistry);

        effectModules.push(effect);
    }

    const effectBlock = effectModules.map((m) => m.getCall(processArgs(m, rng))).join('\n');

    return { effectBlock, effectModules };
}
