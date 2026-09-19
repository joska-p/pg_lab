import { create } from "zustand";

import type { AtlasStoreState } from "./types";

const atlasStore = create<AtlasStoreState>(() => ({
  seed: "indigenous-geometry-2026",
  complexity: 25,
  modulo: 4,
  symbolType: 0,
  palette: 0,
  glitch: 0.15,
}));

export { atlasStore };
