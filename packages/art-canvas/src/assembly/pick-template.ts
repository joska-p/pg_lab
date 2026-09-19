import { applyMood } from "./apply-mood";
import { TEMPLATE_REGISTRY } from "./registries";

import type { Mood } from "./moods";
import type { SeededRandom } from "./seeded-random";

export function pickTemplate(rng: SeededRandom, mood: Mood) {
  return rng.pickWeighted(applyMood(TEMPLATE_REGISTRY, mood.templateWeights));
}
