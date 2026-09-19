export function applyMood<T extends { name: string; weight?: number }>(
  registry: readonly T[],
  moodWeights?: Record<string, number>,
): T[] {
  if (!moodWeights) return [...registry];

  return registry.map((item) => ({
    ...item,
    weight: (item.weight ?? 1.0) * (moodWeights[item.name] ?? 1.0),
  }));
}
