import { BufferManager } from './buffer-manager';
import { FusionScheduler } from './fusion-scheduler';
import type { Step } from './manipulations/manifest';
import type { PixelData } from './pixel-data';
import { dispatchStep } from './step-dispatcher';
import type { ArgDefinition, PipelineContext } from './types';

export type { ArgDefinition, Step };

function buildAutoDownscaleStep({
    source,
    steps,
    maximumPixels,
}: {
    source: PixelData;
    steps: Step[];
    maximumPixels: number;
}) {
    if (
        steps.some((step) => step.id === 'resize') ||
        source.width * source.height <= maximumPixels
    ) {
        return null;
    }

    return {
        id: 'resize' as const,
        options: { maximumPixels },
    };
}

export function processImage({
    source,
    steps,
    context,
}: {
    source: PixelData;
    steps: Step[];
    context: PipelineContext;
}): PixelData[] {
    const downscale = buildAutoDownscaleStep({
        source,
        steps,
        maximumPixels: context.maximumPixels,
    });

    if (downscale) {
        console.warn(
            `[pixel] Auto-scaling source image to within ${String(downscale.options.maximumPixels)} pixels.`,
        );
    }

    const effectiveSteps = downscale ? [downscale, ...steps] : steps;
    const snapshots: PixelData[] = [];
    const manager = new BufferManager(source);
    const scheduler = new FusionScheduler();

    for (const step of effectiveSteps) {
        dispatchStep({ step, context, bufferManager: manager, scheduler });
        scheduler.flush(manager);
        snapshots.push(manager.snapshot());
    }

    return snapshots;
}
