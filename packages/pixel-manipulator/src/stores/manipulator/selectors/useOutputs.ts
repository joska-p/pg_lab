import { manipulatorStore } from '../store';
import type { OutputType } from '../types';

function useOutputs(): OutputType[] {
    return manipulatorStore((s) => s.outputs);
}

export { useOutputs };
