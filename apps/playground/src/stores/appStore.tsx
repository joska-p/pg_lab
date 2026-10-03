import type { ShellBackground } from '@repo/ui/components/ShellWrapper';
import { create } from 'zustand';

import type { ExperimentKey } from '../experiments';

interface appStore {
    experimentKey: ExperimentKey;
    shellBackground: ShellBackground;
}

const appStore = create<appStore>(() => ({
    experimentKey: 'home',
    shellBackground: 'auroral-fluid',
}));

export function useExperimentKey(): ExperimentKey {
    return appStore((s) => s.experimentKey);
}

export function setExperimentKey(experimentKey: ExperimentKey): void {
    appStore.setState({ experimentKey });
}

export function useShellBackground(): ShellBackground {
    return appStore((s) => s.shellBackground);
}

export function setShellBackground(shellBackground: ShellBackground): void {
    appStore.setState({ shellBackground });
}
