import { create } from "zustand";

export interface StoreState {
  divisions: number;
  lightness: number;
  chroma: number;
  isPlaying: boolean;
}

const store = create<StoreState>(() => ({
  divisions: 5,
  lightness: 0.7,
  chroma: 0.15,
  isPlaying: false,
}));

export function useDivisions() {
  return store((state) => state.divisions);
}

export function useLightness() {
  return store((state) => state.lightness);
}

export function useChroma() {
  return store((state) => state.chroma);
}

export function useIsPlaying() {
  return store((state) => state.isPlaying);
}

export function setDivisions(divisions: number) {
  store.setState({ divisions });
}

export function setLightness(lightness: number) {
  store.setState({ lightness });
}

export function setChroma(chroma: number) {
  store.setState({ chroma });
}

export function setIsPlaying(isPlaying: boolean) {
  store.setState({ isPlaying });
}
