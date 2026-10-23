import type { ShellBackground } from '@repo/ui/recipes/shellBackground';
import { create } from 'zustand';

interface appStore {
    shellBackground: ShellBackground;
}

const appStore = create<appStore>(() => ({
    shellBackground: 'lava-flow',
}));

export function useShellBackground(): ShellBackground {
    return appStore((s) => s.shellBackground);
}

export function setShellBackground(shellBackground: ShellBackground): void {
    appStore.setState({ shellBackground });
}
