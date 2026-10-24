import { ALL_MANIPULATIONS } from '../../../processor/manipulations/manifest';

export interface ParamDef {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    default: number;
}

export interface ManipInfo {
    id: string;
    label: string;
    type: 'pixel' | 'neighborhood' | 'global';
    path: string;
    params?: ParamDef[];
    description: string;
    longDescription: string;
}

export type EndpointId =
    | { kind: 'overview' }
    | { kind: 'manip'; id: string }
    | { kind: 'pipeline'; id: 'resize' | 'chaining' }
    | { kind: 'internals'; id: string };

type EndpointItemType = 'overview' | 'pixel' | 'neighborhood' | 'global' | 'pipeline' | 'internals';

export interface EndpointItem {
    id: string;
    label: string;
    type: EndpointItemType;
    description: string;
    path: string;
    params?: ParamDef[];
}

export interface EndpointGroup {
    label: string;
    items: EndpointItem[];
}

export function isActiveEndpoint(a: EndpointId, b: EndpointId): boolean {
    if (a.kind === 'overview' && b.kind === 'overview') {
        return true;
    }

    if (a.kind === 'manip' && b.kind === 'manip' && a.id === b.id) {
        return true;
    }

    if (a.kind === 'pipeline' && b.kind === 'pipeline' && a.id === b.id) {
        return true;
    }

    if (a.kind === 'internals' && b.kind === 'internals' && a.id === b.id) {
        return true;
    }

    return false;
}

export function findItemForEndpoint(
    groups: EndpointGroup[],
    endpoint: EndpointId,
): EndpointItem | undefined {
    if (endpoint.kind === 'overview') {
        return groups[0]?.items[0];
    }

    for (const group of groups) {
        for (const item of group.items) {
            if (endpoint.kind === 'manip' && item.id === endpoint.id && item.type !== 'pipeline') {
                return item;
            }

            if (
                endpoint.kind === 'pipeline' &&
                item.id === endpoint.id &&
                item.type === 'pipeline'
            ) {
                return item;
            }

            if (
                endpoint.kind === 'internals' &&
                item.id === endpoint.id &&
                item.type === 'internals'
            ) {
                return item;
            }
        }
    }

    return undefined;
}

function paramsFromDefinition(
    definition: (typeof ALL_MANIPULATIONS)[number],
): ParamDef[] | undefined {
    const argDefs = definition.ui.argDefinitions;
    const defaults = definition.ui.defaultArgs;

    if (argDefs.length === 0) {
        return undefined;
    }

    return argDefs.map((arg) => ({
        key: arg.key,
        label: arg.label,
        min: arg.min,
        max: arg.max,
        step: arg.step,
        default: defaults[arg.key] ?? 0,
    }));
}

function manipToInfo(definition: (typeof ALL_MANIPULATIONS)[number]): ManipInfo {
    const params = paramsFromDefinition(definition);

    return {
        id: definition.id,
        label: definition.ui.name,
        type: definition.access,
        path: `/manip/${definition.id}`,
        ...(params && { params }),
        description: definition.ui.description,
        longDescription: definition.ui.longDescription,
    };
}

function manipToItem(definition: (typeof ALL_MANIPULATIONS)[number]): EndpointItem {
    const params = paramsFromDefinition(definition);

    return {
        id: definition.id,
        label: definition.ui.name,
        type: definition.access,
        description: definition.ui.description,
        path: `/manip/${definition.id}`,
        ...(params && { params }),
    };
}

type Access = (typeof ALL_MANIPULATIONS)[number]['access'];

const GROUP_MAP: Record<Access, string> = {
    pixel: 'Pixel',
    neighborhood: 'Neighbor',
    global: 'Global',
};

const ACCESS_ORDER: Access[] = ['pixel', 'neighborhood', 'global'];

const PIPELINE_ITEMS: EndpointItem[] = [
    {
        id: 'resize',
        label: 'Resize',
        type: 'pipeline',
        path: '/pipeline/resize',
        description: 'Resize images at any point in the pipeline',
    },
    {
        id: 'chaining',
        label: 'Chaining',
        type: 'pipeline',
        path: '/pipeline/chaining',
        description: 'Compose multiple manipulations into a single pipeline run',
    },
];

const OVERVIEW_ITEM: EndpointItem = {
    id: 'overview',
    label: 'API Overview',
    type: 'overview',
    path: '/overview',
    description: 'Architecture, API surfaces, and quick start guide',
};

const INTERNAL_SECTIONS: EndpointItem[] = [
    {
        id: 'execution-engine',
        label: 'Execution Engine',
        type: 'internals',
        path: '/internals/execution-engine',
        description: 'Pipeline run loop, double-buffering, and step routing',
    },
    {
        id: 'fusion-scheduler',
        label: 'Fusion Scheduler',
        type: 'internals',
        path: '/internals/fusion-scheduler',
        description: 'Batching consecutive pixel ops into a single pass',
    },
    {
        id: 'tiling',
        label: 'Neighborhood Tiling',
        type: 'internals',
        path: '/internals/tiling',
        description: 'Tile-based convolution for memory-efficient large-image processing',
    },
    {
        id: 'resize-algorithm',
        label: 'Resize Algorithm',
        type: 'internals',
        path: '/internals/resize-algorithm',
        description: 'Bilinear interpolation and dimension logic',
    },
    {
        id: 'worker-architecture',
        label: 'Worker Architecture',
        type: 'internals',
        path: '/internals/worker-architecture',
        description: 'Web Worker pool, FIFO queue, and zero-copy Transferables',
    },
    {
        id: 'configuration',
        label: 'Configuration',
        type: 'internals',
        path: '/internals/configuration',
        description: 'Default limits and environment settings',
    },
];

const MANIP_GROUPS: EndpointGroup[] = ACCESS_ORDER.map((access) => ({
    label: GROUP_MAP[access],
    items: ALL_MANIPULATIONS.filter((m) => m.access === access).map(manipToItem),
}));

export const ENDPOINT_GROUPS: EndpointGroup[] = [
    { label: 'Overview', items: [OVERVIEW_ITEM] },
    ...MANIP_GROUPS,
    { label: 'Pipeline', items: PIPELINE_ITEMS },
    { label: 'Internals', items: INTERNAL_SECTIONS },
];

export function findManipById(id: string): ManipInfo | undefined {
    const definition = ALL_MANIPULATIONS.find((m) => m.id === id);

    return definition ? manipToInfo(definition) : undefined;
}
