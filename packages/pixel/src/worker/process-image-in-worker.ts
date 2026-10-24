import { WorkerPool } from '@repo/worker-pool/worker-pool';

import { ALL_MANIPULATIONS } from '../processor/manipulations/manifest';
import type { Step } from '../processor/manipulations/manifest';
import { PixelData } from '../processor/pixel-data';
import type { ArgDefinition } from '../processor/types';
import { isSerializedImageDataArray } from './serialization';

export type { ArgDefinition, Step };

export interface ManipulationInfo {
    readonly id: string;
    readonly access: 'pixel' | 'neighborhood' | 'global';
    readonly name: string;
    readonly description: string;
    readonly longDescription: string;
    readonly defaultArgs: Readonly<Record<string, number>>;
    readonly argDefinitions: readonly ArgDefinition[];
}

export interface RunConfig {
    sourceImageData: ImageData;
    steps: readonly Step[];
    maximumPixels?: number;
}

const pool = new WorkerPool<RunConfig, ImageData[]>({
    maxPoolSize: navigator.hardwareConcurrency,
    workerFactory: () =>
        new Worker(new URL('./pipeline-worker', import.meta.url), {
            type: 'module',
        }),
    serialize: (task) => {
        const clampedCopy = new Uint8ClampedArray(task.sourceImageData.data);
        const pixelData = new PixelData(
            task.sourceImageData.width,
            task.sourceImageData.height,
            clampedCopy,
        );

        return {
            message: {
                sourceImageData: pixelData,
                steps: task.steps,
                maximumPixels: task.maximumPixels,
            },
            transfer: [clampedCopy.buffer],
        };
    },
    deserialize: (event: MessageEvent<Record<string, unknown>>) => {
        if ('error' in event.data) {
            return { ok: false, error: new Error(event.data['error'] as string) };
        }

        if (!isSerializedImageDataArray(event.data)) {
            return {
                ok: false,
                error: new Error('Invalid serialized ImageData format'),
            };
        }

        return {
            ok: true,
            value: event.data.map((r) => {
                const clonedData = Uint8ClampedArray.from(r.data);

                return new ImageData(clonedData, r.width, r.height);
            }),
        };
    },
});

function buildCatalog(): Record<string, ManipulationInfo> {
    const catalog: Record<string, ManipulationInfo> = {};

    for (const def of ALL_MANIPULATIONS) {
        catalog[def.id] = {
            id: def.id,
            access: def.access,
            name: def.ui.name,
            description: def.ui.description,
            longDescription: def.ui.longDescription,
            defaultArgs: def.ui.defaultArgs,
            argDefinitions: def.ui.argDefinitions,
        };
    }

    return catalog;
}

const MANIPULATIONS = buildCatalog();

export function getManipulations(): Readonly<Record<string, ManipulationInfo>> {
    return MANIPULATIONS;
}

export function getManipulationsByAccess(
    access: 'pixel' | 'neighborhood' | 'global',
): Record<string, ManipulationInfo> {
    const result: Record<string, ManipulationInfo> = {};

    for (const [id, info] of Object.entries(MANIPULATIONS)) {
        if (info.access === access) {
            result[id] = info;
        }
    }

    return result;
}

export function processImageInWorker(config: RunConfig): Promise<ImageData[]> {
    return pool.run(config);
}

export function teardownWorkerPool(): void {
    pool.teardown();
}
