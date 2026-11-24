import { MOOD_REGISTRY } from './moods';
import type { Mood, MoodName } from './moods';
import type { SeededRandom } from './seeded-random';

export function pickMood(rng: SeededRandom, selectedMood?: MoodName): Mood {
    let mood;

    if (selectedMood) {
        mood = MOOD_REGISTRY.find((m) => m.name === selectedMood);
    }

    return mood ?? rng.pickWeighted(MOOD_REGISTRY);
}

export function effectiveComplexity(complexity: number, mood: Mood): number {
    return Math.max(1, Math.min(5, complexity + mood.complexityBias));
}
