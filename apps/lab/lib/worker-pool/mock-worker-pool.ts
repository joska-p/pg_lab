type Handler<TTask, TResult> = (task: TTask) => TResult;

/** Synchronous stand-in for WorkerPool, for tests that have no Web Workers. */
export class MockWorkerPool<TTask, TResult> {
    private handler: Handler<TTask, TResult>;

    constructor(handler: Handler<TTask, TResult>) {
        this.handler = handler;
    }

    run(task: TTask): Promise<TResult> {
        return Promise.resolve(this.handler(task));
    }

    teardown(): void {
        return undefined;
    }
}
