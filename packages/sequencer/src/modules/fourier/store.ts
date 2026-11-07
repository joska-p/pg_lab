import { WorkerPool } from '@repo/worker-pool/worker-pool';

import type { Epicycle } from './types';

const fourierPool = new WorkerPool<Float32Array, Epicycle[]>({
    workerFactory: () =>
        new Worker(new URL('./fourier.worker.ts', import.meta.url), { type: 'module' }),
    maxPoolSize: 1,
    serialize: (task) => ({
        message: task,
        transfer: [task.buffer],
    }),
    deserialize: (event) => {
        const data = event.data;

        if (
            typeof data === 'object' &&
            data !== null &&
            'ok' in data &&
            data.ok === true &&
            'value' in data &&
            data.value !== undefined
        ) {
            return { ok: true, value: data.value };
        }

        return {
            ok: false,
            error: new Error(
                typeof data === 'object' && data !== null && 'error' in data
                    ? String(data.error ?? 'Unknown error in worker')
                    : 'Unknown error in worker',
            ),
        };
    },
});

const MAX_CACHE_SIZE = 20;
const epicycleCache = new Map<string, Epicycle[]>();
const activeQueries = new Set<string>();

function hashPairs(pairs: Float32Array): string {
    let hash = 0;

    for (const pair of pairs) {
        hash = ((hash << 5) - hash + pair) | 0;
    }

    return `${String(pairs.length)}:${String(hash)}`;
}

function cacheGet(key: string): Epicycle[] | undefined {
    const entry = epicycleCache.get(key);

    if (entry) {
        epicycleCache.delete(key);
        epicycleCache.set(key, entry);
    }

    return entry;
}

function cacheSet(key: string, value: Epicycle[]): void {
    if (epicycleCache.size >= MAX_CACHE_SIZE) {
        const oldest = epicycleCache.keys().next();

        if (!oldest.done && oldest.value) {
            epicycleCache.delete(oldest.value);
        }
    }

    epicycleCache.set(key, value);
}

export function fetchFourierEpicycles(
    pairs: Float32Array,
    triggerRedraw: () => void,
): Epicycle[] | null {
    const cacheKey = hashPairs(pairs);

    const cached = cacheGet(cacheKey);

    if (cached) {
        return cached;
    }

    if (!activeQueries.has(cacheKey)) {
        activeQueries.add(cacheKey);

        fourierPool
            .run(pairs)
            .then((result: Epicycle[]) => {
                cacheSet(cacheKey, result);
                activeQueries.delete(cacheKey);
                triggerRedraw();
            })
            .catch(console.error);
    }

    return null;
}
