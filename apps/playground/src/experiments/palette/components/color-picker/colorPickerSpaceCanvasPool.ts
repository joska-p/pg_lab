import { WorkerPool } from '@repo/worker-pool/worker-pool';

import { isColorPickerSpaceCanvasResponse } from './types';
import type { RenderColorPickerSpaceTask } from './types';

function createColorPickerSpaceCanvasPool(): WorkerPool<RenderColorPickerSpaceTask, ImageBitmap> {
    return new WorkerPool<RenderColorPickerSpaceTask, ImageBitmap>({
        maxPoolSize: 1,
        workerFactory: () =>
            new Worker(new URL('./colorPickerSpaceCanvas.worker.ts', import.meta.url), {
                type: 'module',
            }),
        serialize: (task) => ({ message: task }),
        deserialize: (event) => {
            const response = event.data;

            if (!isColorPickerSpaceCanvasResponse(response)) {
                return {
                    ok: false,
                    error: new Error('Invalid color picker space canvas response'),
                };
            }

            if (response.ok) {
                return { ok: true, value: response.bitmap };
            }

            return { ok: false, error: new Error(response.error) };
        },
    });
}

export { createColorPickerSpaceCanvasPool };
