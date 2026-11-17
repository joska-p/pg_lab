import { WorkerPool } from '../../worker-pool/worker-pool';
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

export interface PipelinePool {
    run(config: RunConfig): Promise<ImageData[]>;
    teardown(): void;
}

/**
 * The factory is injected so a caller can supply its own worker URL. One worker keeps replies in
 * request order; the caller still discards stale generations.
 */
export function createPipelinePool(workerFactory: () => Worker): PipelinePool {
    const pool = new WorkerPool<RunConfig, ImageData[]>({
        maxPoolSize: 1,
        workerFactory,
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
        deserialize: (event) => {
            const data: unknown = event.data;

            if (typeof data === 'object' && data !== null && 'error' in data) {
                const message =
                    typeof data.error === 'string' ? data.error : 'Unknown worker error';

                return { ok: false, error: new Error(message) };
            }

            if (!isSerializedImageDataArray(data)) {
                return {
                    ok: false,
                    error: new Error('Invalid serialized ImageData format'),
                };
            }

            return {
                ok: true,
                value: data.map((result) => {
                    const clonedData = Uint8ClampedArray.from(result.data);

                    return new ImageData(clonedData, result.width, result.height);
                }),
            };
        },
    });

    return {
        run: (config) => pool.run(config),
        teardown: () => pool.teardown(),
    };
}

/** Creates the shared Vite module worker; both pixel pages use the same pool. */
export function createPixelPool(): PipelinePool {
    return createPipelinePool(
        () =>
            new Worker(new URL('./pipeline-worker.ts', import.meta.url), {
                type: 'module',
            }),
    );
}

function buildCatalog(): Record<string, ManipulationInfo> {
    const catalog: Record<string, ManipulationInfo> = {};

    for (const definition of ALL_MANIPULATIONS) {
        catalog[definition.id] = {
            id: definition.id,
            access: definition.access,
            name: definition.ui.name,
            description: definition.ui.description,
            longDescription: definition.ui.longDescription,
            defaultArgs: definition.ui.defaultArgs,
            argDefinitions: definition.ui.argDefinitions,
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
