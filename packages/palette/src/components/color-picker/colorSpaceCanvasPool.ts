import { WorkerPool } from '@repo/worker-pool/worker-pool';

import { isColorSpaceCanvasResponse } from './types';
import type { RenderColorSpaceTask } from './types';

function createColorSpaceCanvasPool(): WorkerPool<RenderColorSpaceTask, ImageBitmap> {
    return new WorkerPool<RenderColorSpaceTask, ImageBitmap>({
        maxPoolSize: 1,
        workerFactory: () =>
            new Worker(new URL('./colorSpaceCanvas.worker.ts', import.meta.url), {
                type: 'module',
            }),
        serialize: (task) => ({ message: task }),
        deserialize: (event) => {
            const response = event.data;

            if (!isColorSpaceCanvasResponse(response)) {
                return { ok: false, error: new Error('Invalid color space canvas response') };
            }

            if (response.ok) {
                return { ok: true, value: response.bitmap };
            }

            return { ok: false, error: new Error(response.error) };
        },
    });
}

export { createColorSpaceCanvasPool };
