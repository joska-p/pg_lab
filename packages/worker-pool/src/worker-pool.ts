import type { WorkerPoolConfig, WorkerResult } from './types.ts';

export type { WorkerPoolConfig, WorkerResult };

interface PoolEntry {
    worker: Worker;
    busy: boolean;
}

interface QueuedJob<TTask, TResult> {
    task: TTask;
    resolve: (result: TResult) => void;
    reject: (error: Error) => void;
}

export class WorkerPool<TTask, TResult> {
    private config: WorkerPoolConfig<TTask, TResult>;
    private pool: PoolEntry[] = [];
    private queue: QueuedJob<TTask, TResult>[] = [];
    private maxPoolSize: number;

    constructor(config: WorkerPoolConfig<TTask, TResult>) {
        this.config = config;
        this.maxPoolSize = config.maxPoolSize ?? 4;
    }

    run(task: TTask): Promise<TResult> {
        const entry = this.acquireWorker();

        if (entry) {
            return this.dispatch(entry, task);
        }

        if (this.pool.length < this.maxPoolSize) {
            const worker = this.config.workerFactory();
            const entry: PoolEntry = { worker, busy: false };

            this.pool.push(entry);

            return this.dispatch(entry, task);
        }

        return new Promise<TResult>((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
        });
    }

    /** Rejects queued tasks too — otherwise their promises would hang forever. */
    teardown(): void {
        const err = new Error('pool torn down');

        for (const job of this.queue) {
            job.reject(err);
        }

        this.queue.length = 0;
        this.pool.forEach((entry) => {
            entry.worker.terminate();
        });
        this.pool = [];
    }

    private acquireWorker(): PoolEntry | null {
        return this.pool.find((entry) => !entry.busy) ?? null;
    }

    private dispatch(entry: PoolEntry, task: TTask): Promise<TResult> {
        const { message, transfer } = this.config.serialize(task);

        return new Promise<TResult>((resolve, reject) => {
            entry.busy = true;

            const onMessage = (event: MessageEvent) => {
                cleanup();
                const result = this.config.deserialize(event);

                if (result.ok) {
                    resolve(result.value);
                } else {
                    reject(result.error);
                }
            };

            const onError = (event: ErrorEvent) => {
                cleanup();
                reject(new Error(event.message || 'Unknown worker error'));
            };

            const cleanup = () => {
                entry.worker.removeEventListener('message', onMessage);
                entry.worker.removeEventListener('error', onError);
                entry.busy = false;
                this.drainQueue();
            };

            entry.worker.addEventListener('message', onMessage);
            entry.worker.addEventListener('error', onError);

            if (transfer && transfer.length > 0) {
                entry.worker.postMessage(message, transfer);
            } else {
                entry.worker.postMessage(message);
            }
        });
    }

    private drainQueue(): void {
        if (this.queue.length === 0) {
            return;
        }

        const entry = this.acquireWorker();

        if (!entry) {
            return;
        }

        const job = this.queue.shift();

        if (!job) {
            return;
        }

        this.dispatch(entry, job.task).then(job.resolve, job.reject);
    }
}
