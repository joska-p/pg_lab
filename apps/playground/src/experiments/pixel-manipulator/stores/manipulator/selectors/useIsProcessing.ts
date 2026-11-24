import { manipulatorStore } from '../store';

function useIsProcessing(): boolean {
    return manipulatorStore((s) => s.isProcessing);
}

export { useIsProcessing };
