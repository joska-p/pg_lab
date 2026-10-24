import type { BufferManager } from './buffer-manager';
import type { FusionScheduler } from './fusion-scheduler';
import type { Step } from './manipulations/manifest';
import { runNeighborhoodTiled } from './neighborhood-tiling';
import { PixelData } from './pixel-data';
import type { ManipulationDefinition, PipelineContext } from './types';

interface ExecutorParameters {
    definition: ManipulationDefinition;
    options: Record<string, unknown>;
    context: PipelineContext;
    bufferManager: BufferManager;
    scheduler: FusionScheduler;
}

type ExecutorFunction = (parameters: ExecutorParameters) => void;

const executors: Record<string, ExecutorFunction> = {
    pixel: ({ definition, options, scheduler }) => {
        scheduler.add(definition, options);
    },

    neighborhood: ({ definition, options, context, bufferManager, scheduler }) => {
        scheduler.flush(bufferManager);
        const source = bufferManager.snapshot();

        if (source.width * source.height > context.maximumPixels) {
            bufferManager.replaceWith(runNeighborhoodTiled({ source, definition, options }));
        } else {
            const destination = new Uint8ClampedArray(bufferManager.current.length);

            if (definition.access === 'neighborhood') {
                definition.execute({
                    options,
                    source: bufferManager.current,
                    destination,
                    width: bufferManager.width,
                    height: bufferManager.height,
                });
            }

            const pixelData = new PixelData(bufferManager.width, bufferManager.height);

            pixelData.data.set(destination);
            bufferManager.replaceWith(pixelData);
        }
    },

    global: ({ definition, options, bufferManager, scheduler }) => {
        scheduler.flush(bufferManager);

        if (definition.access === 'global') {
            bufferManager.replaceWith(
                definition.execute({
                    options,
                    imageData: bufferManager.snapshot(),
                }),
            );
        }
    },
};

export function dispatchStep({
    step,
    context,
    bufferManager,
    scheduler,
}: {
    step: Step;
    context: PipelineContext;
    bufferManager: BufferManager;
    scheduler: FusionScheduler;
}) {
    const definition = context.registry.get(step.id);
    const options = (step as { options?: Record<string, unknown> }).options ?? {};

    const executor = executors[definition.access];

    executor({ definition, options, context, bufferManager, scheduler });
}
