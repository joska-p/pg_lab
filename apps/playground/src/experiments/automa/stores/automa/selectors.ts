import { useStore } from 'zustand';

import { automaStore } from './store';
import type { AutomaState, BrushMode } from './store';

const useSelector = <T>(selector: (state: AutomaState) => T): T => useStore(automaStore, selector);

export const useBrushMode = (): BrushMode => useSelector((s) => s.toolMode);
export const useStateColors = (): string[] => useSelector((s) => s.stateColors);
export const usePaletteBrush = (): AutomaState['paletteBrush'] =>
    useSelector((s) => s.paletteBrush);
export const useGeneration = (): number => useSelector((s) => s.generation);
export const useRuleId = (): AutomaState['ruleId'] => useSelector((s) => s.ruleId);
export const useRunning = (): boolean => useSelector((s) => s.running);
export const useSpeedMs = (): number => useSelector((s) => s.speedMs);
