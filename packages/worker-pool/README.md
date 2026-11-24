# @repo/worker-pool

> You write the worker. This package runs it — pooling, queuing, lifecycle, and teardown.

---

## Intention & Concept

You already know how to write a Web Worker: `new Worker(...)`, `postMessage`, listen for responses. What you don't want to write is the boilerplate around it — when to create a worker, when to reuse one, what to do when all workers are busy, and how to clean up on unmount.

`@repo/worker-pool` does that. You provide three hooks that describe _your_ worker (`workerFactory`, `serialize`, `deserialize`); the package handles dispatch, concurrency, queuing, and teardown.

**The origin:** three packages (`automa`, `graph-viz`, `pixel`) each invented their own version of this same boilerplate. This module extracts the common shape into a single, testable class.

## Brainstorming, Inspirations & Credits

- **Borrowed Code & Algorithms:** the worker boilerplate patterns extracted from `@repo/automa` (single dedicated worker, buffer round-trip), `@repo/graph-viz` (one-shot force simulation), and `@repo/pixel` (image pipeline with transferables + custom error protocol).

## Patterns & Gotchas

- **Lazy init:** workers are created on first `run()`, not at construction. Pool size defaults to 4, and idle workers are reused.
- **Queueing:** when all workers are busy, tasks queue FIFO and drain as workers free up. `teardown()` rejects queued tasks too — otherwise their promises would hang forever.
- **Concrete class, not interface:** no abstract interface until a second implementation was needed. `MockWorkerPool` (synchronous, for tests without Web Workers) is that second implementation.
- **Bundler-agnostic:** `workerFactory` is a plain `() => Worker`; the consumer owns URL creation and Vite `?worker&inline` flags.
- **Consumer-defined `deserialize`:** each worker has its own error protocol — the adapter decides how to read a `MessageEvent`.
- **Transferables:** `serialize` can attach transferables for zero-copy buffers (don't forget to clone the buffer first if the caller needs its copy — transferring neuters it).
- **Post-teardown:** a new `run()` after `teardown()` creates fresh workers.

## 📚 References

- [Web Workers API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [MDN: Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)
