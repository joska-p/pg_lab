import { create } from 'zustand';

import type { EndpointId } from '../data/pipeline-docs-data';
// const [activeEndpoint, setActiveEndpoint] = useState<EndpointId>({ kind: 'overview' });
// const [sourceData, setSourceData] = useState<ImageData | null>(null);
// const [paramValues, setParamValues] = useState<Record<string, number>>({});

type theme = 'light' | 'dark' | 'system';

type appStore = {
    theme: theme;
    activeEndPointId: EndpointId;
    sourceData: ImageData | null;
    paramValues: Record<string, number>;
};

const appStore = create<appStore>(() => ({
    theme: 'dark',
    activeEndPointId: { kind: 'overview' },
    sourceData: null,
    paramValues: {},
}));

export function useTheme(): theme {
    return appStore((s) => s.theme);
}

export function setTheme(theme: theme): void {
    appStore.setState({ theme });
}

export function useActiveEndPointId(): EndpointId {
    return appStore((s) => s.activeEndPointId);
}

export function setActiveEndPointId(activeEndPointId: EndpointId): void {
    appStore.setState({ activeEndPointId });
}

export function useSourceData(): ImageData | null {
    return appStore((s) => s.sourceData);
}

export function setSourceData(sourceData: ImageData): void {
    appStore.setState({ sourceData });
}

export function useParamValues(): Record<string, number> {
    return appStore((s) => s.paramValues);
}

export function setParamValues(paramValues: Record<string, number>): void {
    appStore.setState({ paramValues });
}
