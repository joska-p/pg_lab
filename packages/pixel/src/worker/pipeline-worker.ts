import { ALL_MANIPULATIONS } from '../processor/manipulations/manifest';
import type { Step } from '../processor/manipulations/manifest';
import { PixelData } from '../processor/pixel-data';
import { processImage } from '../processor/process-image';
import { Registry } from '../processor/registry';

const DEFAULT_MAXIMUM_PIXELS = 16_000_000;

interface WorkerMessage {
    sourceImageData: { data: Uint8ClampedArray; width: number; height: number };
    steps: Step[];
    maximumPixels?: number;
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
    const { sourceImageData, steps, maximumPixels } = event.data;

    try {
        const registry = Registry.from(ALL_MANIPULATIONS);
        const source = new PixelData(
            sourceImageData.width,
            sourceImageData.height,
            sourceImageData.data,
        );

        const pipelineResult = processImage({
            source,
            steps,
            context: {
                registry,
                maximumPixels: maximumPixels ?? DEFAULT_MAXIMUM_PIXELS,
            },
        });

        const transferables = pipelineResult.map((pd) => pd.data.buffer);

        self.postMessage(pipelineResult, { transfer: transferables });
    } catch (error) {
        self.postMessage({
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
