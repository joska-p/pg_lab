import { createStore } from "zustand/vanilla";

import { GRID_DEFAULT_COLS, GRID_DEFAULT_ROWS } from "../../engine/config";
import { DEFAULT_STATE_COLORS, SPEED_DEFAULT_MS } from "../../lib/constants";

import type { CreatureId } from "../../engine/creature/registry";
import type { SimulationEngine } from "../../engine/gpu/SimulationEngine";
import type { RuleId } from "../../engine/rules/registry";
import type { CssColor } from "@repo/glaze/core/render";

export type BrushMode = "draw" | "erase";

export interface AutomaState {
  engine: SimulationEngine | null;
  toolMode: BrushMode;
  paletteBrush: CreatureId | "pixel";
  stateColors: CssColor[];
  cols: number;
  rows: number;
  generation: number;
  ruleId: RuleId;
  running: boolean;
  speedMs: number;
}

export const automaStore = createStore<AutomaState>()(() => ({
  engine: null,
  toolMode: "draw",
  paletteBrush: "pixel",
  stateColors: [...DEFAULT_STATE_COLORS],
  cols: GRID_DEFAULT_COLS,
  rows: GRID_DEFAULT_ROWS,
  generation: 0,
  ruleId: "conway",
  running: false,
  speedMs: SPEED_DEFAULT_MS,
}));
