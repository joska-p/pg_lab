import { shuffleArray } from "./shuffleArray";

function shuffleObject<T extends Record<string, unknown>>(object: T) {
  const keys = Object.keys(object);
  const values = Object.values(object);
  const shuffledValues = shuffleArray(values);

  return Object.fromEntries(keys.map((key, index) => [key, shuffledValues[index]])) as T;
}

export { shuffleObject };
