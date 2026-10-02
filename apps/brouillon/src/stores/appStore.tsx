import { create } from 'zustand';

import type { ComponentName } from '../experiments/stylex/demos/registry';

interface appStore {
    componentName: ComponentName;
}

const appStore = create<appStore>(() => ({
    componentName: 'button',
}));

export function useComponentName(): ComponentName {
    return appStore((s) => s.componentName);
}

export function setComponentName(componentName: ComponentName): void {
    appStore.setState({ componentName });
}
