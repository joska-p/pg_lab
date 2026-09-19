import { applyMood } from "./apply-mood";
import { processArgs } from "./process-args";
import { SHAPE_REGISTRY, SPACE_REGISTRY } from "./registries";

import type { Mood } from "./moods";
import type { SeededRandom } from "./seeded-random";
import type { ShaderModule } from "../shaders/types";

export function pickModules(
  rng: SeededRandom,
  mood: Mood,
  effectiveComplexity: number,
): { activeModules: ShaderModule[]; spaceBlock: string; shapeBlock: string } {
  const activeModules: ShaderModule[] = [];

  const moodSpaceRegistry = applyMood(SPACE_REGISTRY, mood.moduleWeights);
  let spaceBlock = "";

  for (let d = 0; d < effectiveComplexity; d++) {
    const space = rng.pickWeighted(moodSpaceRegistry);

    activeModules.push(space);
    spaceBlock += `\n${space.getCall(processArgs(space, rng))}`;
  }

  const moodShapeRegistry = applyMood(SHAPE_REGISTRY, mood.moduleWeights);
  const shape = rng.pickWeighted(moodShapeRegistry);

  activeModules.push(shape);

  return {
    activeModules,
    spaceBlock,
    shapeBlock: shape.getCall(processArgs(shape, rng)),
  };
}
