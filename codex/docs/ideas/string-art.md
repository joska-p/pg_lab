# String art

## Idea

Synthesise algorithmic string art from an uploaded image: map local tonal density to thread
placement, then render the accumulated threads on a Canvas2D surface.

## Visual intent

An image uploaded by the user reappears as a dense web of straight threads, with the subject
emerging from crossings and tonal density rather than from pixels. The view keeps the image
centred and pixel-aligned on resize, with a simple theme control around the stage.

## Why it was kept

It is a distinctive CPU-side procedural renderer, complementary to the GPU-heavy Experiments in
the Workbench. The surrounding pipeline is small and reusable: upload to `ImageData`, apply a
chain of pixel transforms, then blit the result through `CpuSurface`.

## What to revisit

- The transform chain is currently empty (`TRANSFORMS = []`): there is no string art algorithm
  yet, only the upload/fit/display shell.
- Design the thread placement strategy (density sampling, pin layout, line ordering, palette)
  and expose meaningful controls instead of the placeholder theme selector.
- Decide whether the idea deserves a full Experiment in `apps/playground/src/experiments/` or
  remains parked here until the algorithm exists.
