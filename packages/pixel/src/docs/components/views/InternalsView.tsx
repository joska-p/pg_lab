import { ENDPOINT_GROUPS, findItemForEndpoint } from '../data/pipeline-docs-data';
import type { EndpointItem } from '../data/pipeline-docs-data';

function SectionHeader({ item }: { item: EndpointItem | undefined }) {
    return (
        <>
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{item?.label}</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm">{item?.description}</p>
            <p className="text-xs opacity-60">{item?.path}</p>
        </>
    );
}

function InternalsView({ id }: { id: string }) {
    const item = findItemForEndpoint(ENDPOINT_GROUPS, { kind: 'internals', id });

    if (id === 'execution-engine') {
        return (
            <div className="space-y-6">
                <SectionHeader item={item} />

                <div className="border-border bg-muted/30 border-l-utility-8 rounded-lg border border-l-2 p-4 text-xs whitespace-pre">
                    {`runPipeline({ source, steps, context })
  │
  ├── BufferManager(source)     ← double-buffered pixel arrays
  ├── FusionScheduler()         ← fuses consecutive pixel ops
  │
  └── for each step:
        ├── "snapshot"  → flush scheduler, clone buffer, store
        └── "manip"     → dispatchStep({ step, context, buffer, scheduler })
                            │
                            ├── resize    → computeTargetDimensions() + resizeImageData()
                            ├── pixel     → FusionScheduler.add() (deferred)
                            ├── neighbor  → flush scheduler, run convolution
                            │               (tiled if image > maximumPixels)
                            └── global    → flush scheduler, run transform
  │
  └── final flush
  └── return { source, final, snapshots }`}
                </div>

                <div className="border-border bg-muted/30 border-l-utility-5 rounded-lg border border-l-2 p-4">
                    <h3 className="mb-2 text-xs font-semibold uppercase">BufferManager</h3>
                    <p className="text-muted-foreground text-sm">
                        Double-buffering avoids allocating a new array for every pixel operation.
                        Two
                        <code className="mx-1">Uint8ClampedArray</code> buffers swap on each pass
                        via O(1) pointer flip. <code className="mx-1">snapshot()</code> clones the
                        current buffer into a new ImageData;{' '}
                        <code className="mx-1">replaceWith()</code> resets both buffers when resize
                        or global ops change geometry.
                    </p>
                </div>
            </div>
        );
    }

    if (id === 'fusion-scheduler') {
        return (
            <div className="space-y-6">
                <SectionHeader item={item} />

                <p className="text-muted-foreground text-sm">
                    Consecutive pixel-type steps are fused into a single pixel loop to avoid N
                    full-image passes. The scheduler queues pixel ops and runs them in one pass when
                    flushed.
                </p>

                <div className="border-border bg-muted/30 border-l-utility-5 rounded-lg border border-l-2 p-4 text-xs whitespace-pre">
                    {`For each pixel (i = 0 .. pixelCount-1):
  red,green,blue,alpha = current[i]
  for each (definition, options) in batch:
    [red,green,blue,alpha] = definition.function({ red, green, blue, alpha, options })
  other[i] = clamp(red,green,blue,alpha)
swap()`}
                </div>

                <p className="text-muted-foreground text-sm">
                    Non-pixel operations (neighborhood, global, resize, snapshot) force a flush
                    before executing, ensuring pending pixel ops are applied first.
                </p>
            </div>
        );
    }

    if (id === 'tiling') {
        return (
            <div className="space-y-6">
                <SectionHeader item={item} />

                <p className="text-muted-foreground text-sm">
                    Large neighborhood operations are tiled to avoid allocating full-size temporary
                    buffers. Each tile includes a halo border of{' '}
                    <code className="mx-1">radius</code> pixels so edge pixels have neighbors
                    available.
                </p>

                <div className="border-border bg-muted/30 border-l-utility-3 rounded-lg border border-l-2 p-4 text-xs whitespace-pre">
                    {`TILE_SIZE = 512 pixels per edge

For each tile:
  1. extractTile({ tileX, tileY, tileWidth, tileHeight, halo })
     → copies padded region clamped to image bounds
  2. run convolution on tile (with halo)
  3. blitTile({ destination, tile, tileX, tileY, tileWidth, tileHeight, halo })
     → writes only the non-halo center region back`}
                </div>

                <p className="text-muted-foreground text-sm">
                    Peak memory drops from <code className="mx-1">(width × height)</code> to
                    <code className="mx-1">(TILE_SIZE + 2×halo)²</code>. The result is identical to
                    running convolution on the full image.
                </p>
            </div>
        );
    }

    if (id === 'resize-algorithm') {
        return (
            <div className="space-y-6">
                <SectionHeader item={item} />

                <p className="text-muted-foreground text-sm">
                    Resize uses bilinear interpolation. For each output pixel, it samples the 4
                    nearest source pixels and interpolates.
                </p>

                <div className="border-border bg-muted/30 border-l-utility-4 rounded-lg border border-l-2 p-4 text-xs whitespace-pre">
                    {`sourceX = x * (sourceWidth / targetWidth)
sourceY = y * (sourceHeight / targetHeight)

x0 = floor(sourceX), x1 = min(x0+1, sourceWidth-1)
y0 = floor(sourceY), y1 = min(y0+1, sourceHeight-1)

top    = source[x0,y0] * (1 - dx) + source[x1,y0] * dx
bottom = source[x0,y1] * (1 - dx) + source[x1,y1] * dx
output = top * (1 - dy) + bottom * dy`}
                </div>

                <div className="border-border overflow-hidden rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground border-border border-b text-xs font-semibold uppercase">
                                <th className="px-4 py-2.5">Case</th>
                                <th className="px-4 py-2.5">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">maximumPixels</td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Scale to fit pixel budget, aspect-ratio-preserved
                                </td>
                            </tr>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">
                                    width + height + fill
                                </td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Exact dimensions (stretch)
                                </td>
                            </tr>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">
                                    width + height + contain
                                </td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Fit within bounds, aspect-ratio-preserved
                                </td>
                            </tr>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">
                                    width + height + cover
                                </td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Fill bounds, aspect-ratio-preserved (crops)
                                </td>
                            </tr>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">width only</td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Scale proportionally by width
                                </td>
                            </tr>
                            <tr className="border-border">
                                <td className="text-primary px-4 py-2.5 text-xs">height only</td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Scale proportionally by height
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (id === 'worker-architecture') {
        return (
            <div className="space-y-6">
                <SectionHeader item={item} />

                <div className="border-border bg-muted/30 border-l-utility-1 rounded-lg border border-l-2 p-4">
                    <h3 className="mb-2 text-xs font-semibold uppercase">pipeline-worker.ts</h3>
                    <p className="text-muted-foreground text-sm">
                        Stateless worker. Each message rebuilds the registry from
                        <code className="mx-1">ALL_MANIPULATIONS</code> and calls
                        <code className="mx-1">runPipeline()</code>. Results are transferred back
                        (zero-copy) via <code className="mx-1">postMessage</code> Transferables.
                    </p>
                </div>

                <div className="border-border bg-muted/30 border-l-utility-6 rounded-lg border border-l-2 p-4">
                    <h3 className="mb-2 text-xs font-semibold uppercase">pipeline-gateway.ts</h3>
                    <p className="text-muted-foreground text-sm">
                        Main-thread pool manager. Workers are lazily created on first call. If all
                        workers are busy, jobs queue in FIFO order and dispatch as workers free up.
                        Call
                        <code className="mx-1">pipelineGateway.teardown()</code> on app unmount to
                        terminate workers.
                    </p>
                    <div className="border-border bg-background mt-3 rounded border p-3 text-xs whitespace-pre">
                        {`Pool:     up to min(hardwareConcurrency, 4) workers
Queue:    FIFO for overflow
Dispatch: postMessage with Transferable buffers
          (zero-copy pixel transfer)`}
                    </div>
                </div>
            </div>
        );
    }

    if (id === 'configuration') {
        return (
            <div className="space-y-6">
                <SectionHeader item={item} />

                <div className="border-border overflow-hidden rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground border-border border-b text-xs font-semibold uppercase">
                                <th className="px-4 py-2.5">Constant</th>
                                <th className="px-4 py-2.5">Value</th>
                                <th className="px-4 py-2.5">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-border">
                                <td className="text-primary px-4 py-2.5 text-xs">
                                    DEFAULT_MAXIMUM_PIXELS
                                </td>
                                <td className="text-foreground/80 px-4 py-2.5 text-xs">
                                    16,000,000
                                </td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    ~16 megapixel default cap. Auto-downscale if source exceeds this
                                    value. Also triggers tiled path for neighborhood ops.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return <div className="text-muted-foreground py-12 text-center text-sm">Section not found</div>;
}

export { InternalsView };
