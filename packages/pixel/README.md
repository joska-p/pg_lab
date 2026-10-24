# @repo/pixel

> A pipeline that translates raw pixel data through chains of transforms, each step breathing a new visual texture into the image — all off the main thread, with zero image-processing dependencies.
> Current Status: 🟢 Stable

This README acts as the local concept spec — focusing on the "why", the mathematical inspirations, and the design decisions. API inventory is automatically handled by TypeDoc.

---

## 🎯 Intention & Concept

Pixel is a TypeScript-native image manipulation engine that runs entirely in the browser. It gives you a declarative pipeline: declare the steps, hand over an `ImageData`, and watch it pass through a choreography of per-pixel fusions, neighborhood convolutions, and geometry-bending global transforms — all orchestrated across a Web Worker pool without touching a single line of off-thread code.

The goal is simple: zero external image-processing dependencies, full compile-time safety on every step and option shape, and a single package that hides the machinery of worker pools, buffer management, and fusion scheduling.

### Package structure

- **`processor/`** — Pure TypeScript core. `processImage()` takes a source image + steps and returns transformed `PixelData[]`. Zero framework dependencies.
- **`worker/`** — Same processing via a Web Worker pool. `processImageInWorker()` serializes data, dispatches to workers, and deserializes results.
- **`react/`** — `usePixel()` hook for React integration.
- **`docs/`** — Interactive documentation UI.

## 🥷 Brainstorming, Inspirations & Credits

- **Visual Inspo:** classic photo-editing filter stacks (grayscale, sepia, brightness, contrast).
- **Math / Papers:** per-pixel color transforms, convolution kernels (neighborhood ops).
- **Borrowed Code & Algorithms:** worker-pool dispatch pattern (shared with `@repo/worker-pool`), `Transferable` buffers for zero-copy, typed step manifest.

## ⚠️ Patterns & Gotchas

- **`Step` is compile-time-safe.** The type is derived from the manipulation manifest — invalid step IDs and option shapes are caught at compile time (`{ id: 'brightness', options: { wrong: 1.2 } }` is a type error).
- **Steps are fused, snapshots aren't.** Consecutive pixel operations collapse into a single pass by the fusion scheduler — but every step still yields its own `ImageData` snapshot in the results.
- **Fences flush the scheduler.** Neighborhood and global ops flush pending fusions before they run — matters when composing aggressive contrast stretches with sharpening kernels.
- **Off-thread by design.** Execution runs through a worker pool with `Transferable` buffers; large images never stall the UI thread. Call `teardownWorkerPool()` on app unmount to terminate workers and clear the queue.
- **Two entry points, same shape.** `processImage(config)` runs in the current thread; `processImageInWorker(config)` runs via workers. Same signature, same return type.

## 📚 References

- [MDN — ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)
- [MDN — Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)

---

_Part of the [Creative Playground](https://joska-p.github.io/playground). Technical API reference generated at `/docs/api/pixel/`._
