import { createCssColor } from "@repo/glaze/core/render";
import { automaStore } from "./store";
import { GRID_DEFAULT_DENSITY, GRID_DEFAULT_SEED } from "../../engine/config";
import { creatures } from "../../engine/creature/registry";
import gpuPaintShader from "../../engine/gpu/shaders/gpu-paint.frag?raw";
import simStepShader from "../../engine/gpu/shaders/sim-step.frag?raw";
import { SimulationEngine } from "../../engine/gpu/SimulationEngine";
import { rules, type RuleId } from "../../engine/rules/registry";
import { computeDerivedColors } from "../../lib/colors";
import type { BrushMode } from "./store";
import type { CreatureId } from "../../engine/creature/registry";
import type { CssColor } from "@repo/glaze/core/render";
import type { NonNegativeSeconds } from "@repo/glaze/core/time";
import type { GpuSurface } from "@repo/glaze/gpu/GpuSurface";

const DEAD_COLOR_FALLBACK = createCssColor("#070a14");
const ALIVE_COLOR_FALLBACK = createCssColor("#d97706");

// ── Engine lifecycle ──

export function initSimulation(surface: GpuSurface): void {
  destroySimulation();

  const { cols, rows, ruleId, speedMs } = automaStore.getState();
  const buffer = surface.createStateBuffer(cols, rows);
  const engine = new SimulationEngine(buffer, simStepShader, gpuPaintShader, {
    cols,
    rows,
    rule: rules[ruleId],
    speedMs,
    density: GRID_DEFAULT_DENSITY,
    seed: GRID_DEFAULT_SEED,
    onGenerationChange: (generation) => {
      automaStore.setState({ generation });
    },
  });

  automaStore.setState({ engine });
}

export function destroySimulation(): void {
  const { engine } = automaStore.getState();

  if (!engine) return;

  engine.destroy();
  automaStore.setState({ engine: null });
}

// ── Playback ──

export function toggleRunning(): void {
  const { engine, running } = automaStore.getState();

  if (!engine) return;

  if (running) {
    engine.pause();
  } else {
    engine.play();
  }

  automaStore.setState({ running: !running });
}

export function stepOnce(): void {
  automaStore.getState().engine?.step();
}

/** Driven by the surface's frame loop; steps generations while the clock plays. */
export function tickSimulation(delta: NonNegativeSeconds): void {
  automaStore.getState().engine?.tick(delta);
}

export function setSpeed(ms: number): void {
  automaStore.getState().engine?.setSpeed(ms);
  automaStore.setState({ speedMs: ms });
}

// ── Grid editing ──

export function clearGrid(): void {
  automaStore.getState().engine?.clear();
}

export function randomizeGrid(): void {
  automaStore.getState().engine?.randomize();
}

export function paintCell(column: number, row: number, value: number): void {
  automaStore.getState().engine?.paintCell(column, row, value);
}

export function placeCreature(column: number, row: number, id: CreatureId): void {
  automaStore.getState().engine?.placeCreature(column, row, creatures[id]);
}

// ── Rules & palette ──

export function setRule(id: RuleId): void {
  automaStore.getState().engine?.setRule(rules[id]);
  automaStore.setState({ ruleId: id });
  recomputeDerivedColors();
}

export function setStateColor(index: number, color: CssColor): void {
  automaStore.setState((state) => {
    const dead = index === 0 ? color : (state.stateColors[0] ?? DEAD_COLOR_FALLBACK);
    const alive = index === 1 ? color : (state.stateColors[1] ?? ALIVE_COLOR_FALLBACK);

    return { stateColors: computeDerivedColors(rules[state.ruleId].stateCount, dead, alive) };
  });
}

function recomputeDerivedColors(): void {
  const { ruleId, stateColors } = automaStore.getState();

  automaStore.setState({
    stateColors: computeDerivedColors(
      rules[ruleId].stateCount,
      stateColors[0] ?? DEAD_COLOR_FALLBACK,
      stateColors[1] ?? ALIVE_COLOR_FALLBACK,
    ),
  });
}

// ── Tools ──

export function setToolMode(mode: BrushMode): void {
  automaStore.setState({ toolMode: mode });
}

export function setPaletteBrush(id: CreatureId | "pixel"): void {
  automaStore.setState({ paletteBrush: id });
}
