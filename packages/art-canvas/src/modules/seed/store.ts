import { create } from "zustand";

import type { MoodName } from "../../assembly/moods";
import type { PalettePresetName } from "../../palettes/registry";

export interface StoreState {
  seed: string;
  complexity: number;
  mood: MoodName;
  palette: PalettePresetName;
}

const store = create<StoreState>(() => ({
  seed: "random seed",
  complexity: 3,
  mood: "organic",
  palette: "iridescent_opal",
}));

export function useSeed() {
  return store((state) => state.seed);
}
export function useComplexity() {
  return store((state) => state.complexity);
}

export function useMood() {
  return store((state) => state.mood);
}

export function usePalette() {
  return store((state) => state.palette);
}

export function setSeed(seed: string) {
  store.setState({ seed });
}

export function setComplexity(complexity: number) {
  store.setState({ complexity });
}

export function setMood(mood: MoodName) {
  store.setState({ mood });
}

export function setPalette(palette: PalettePresetName) {
  store.setState({ palette });
}
