import { CodeBlock } from '../CodeBlock';
import { imageDataToUrl } from '../helpers';

function OverviewView({ sourceData }: { sourceData: ImageData | null }) {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black">
                    <span className="text-primary">@repo/</span>pixel
                </h1>
                <p className="text-muted-foreground mt-2 max-w-3xl text-base">
                    TypeScript-first, browser-based image manipulation pipeline. Zero dependencies.
                    Chain built-in manipulations into reusable pipelines. Runs off the main thread
                    via a Web Worker pool for non-blocking UI.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="border-border bg-muted/30 border-t-utility-5 col-span-full flex flex-col gap-3 rounded-lg border border-t-2 p-6 lg:col-span-1">
                    <h2 className="text-2xl font-bold">Why a Pipeline API?</h2>
                    <p className="text-muted-foreground text-sm">
                        Canvas 2D&apos;s built-in filters are limited, synchronous, and
                        single-purpose. For anything beyond basic brightness or blur you need direct
                        pixel access — which blocks the main thread. This pipeline gives you
                        composable, off-thread image processing with near-zero overhead, and without
                        leaving the browser.
                    </p>
                </div>
                <div className="border-border bg-muted/30 border-t-utility-4 col-span-full flex flex-col gap-3 rounded-lg border border-t-2 p-6 lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase">Architecture</h3>
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <div className="text-primary mb-1 font-semibold">pixel</div>
                            <div className="text-muted-foreground space-y-0.5 text-xs">
                                <div>.run(&#123; sourceImageData, steps &#125;)</div>
                                <div>.manipulations</div>
                                <div>.getManipulationsByAccess(type)</div>
                                <div>.teardown()</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-primary mb-1 font-semibold">Hidden internals</div>
                            <div className="text-muted-foreground space-y-0.5 text-xs">
                                <div>Web Worker pool (up to 4)</div>
                                <div>Registry + FusionScheduler</div>
                                <div>BufferManager (double-buffered)</div>
                                <div>NeighborhoodTiling (512px tiles)</div>
                            </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                        <strong>3 operation types:</strong> pixel (per-pixel transform),
                        neighborhood (convolution kernel), global (dimension-changing transform).
                    </p>
                </div>
            </div>

            <div className="border-border border-t-utility-1 rounded-lg border border-t-2 p-5">
                <h3 className="text-primary mb-3 text-sm font-bold uppercase">
                    pixel (recommended)
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">
                    Single entry point. Offloads to a Web Worker pool (up to
                    min(hardwareConcurrency, 4)). Built-in manipulations available automatically —
                    no registry setup needed.
                </p>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\nconst result = await pixel.run({\n  sourceImageData: sourceData,\n  steps: [\n    { id: "brightness", options: { value: 1.2 } },\n    { id: "sharpen", options: { strength: 1.5 } },\n    { id: "edge-detect" },\n  ]\n});\n\n// result[0]       → first step\n// result.at(-1)   → final result`}
                />
            </div>

            <div className="border-border border-t-utility-2 rounded-lg border border-t-2 p-5">
                <h3 className="text-primary mb-3 text-sm font-bold uppercase">
                    Browse available manipulations
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">
                    The facade provides a pre-built catalog of all manipulations with UI metadata,
                    filterable by access type.
                </p>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\n// All manipulations\npixel.manipulations;\n\n// Filter by access type\nconst pixelManips = pixel.getManipulationsByAccess("pixel");\nconst neighborhood = pixel.getManipulationsByAccess("neighborhood");`}
                />
            </div>

            <div className="border-border border-t-utility-6 rounded-lg border border-t-2 p-5">
                <h3 className="text-primary mb-3 text-sm font-bold uppercase">Teardown</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                    Terminate workers and clear the job queue. Call on app teardown. Idempotent.
                </p>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\nfunction App() {\n  useEffect(() => () => pixel.teardown(), []);\n  // ...\n}`}
                />
            </div>

            {sourceData && (
                <div className="border-border bg-muted/30 border-l-utility-4 flex items-center gap-4 rounded-lg border border-l-2 p-4">
                    <div className="w-20 shrink-0">
                        <p className="text-muted-foreground mb-1 text-xs">Demo Image</p>
                        <img
                            src={imageDataToUrl(sourceData) ?? ''}
                            alt="demo"
                            className="border-border w-full rounded border"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    <p className="text-muted-foreground text-xs">
                        All manipulations in this documentation run against this source image.
                        Browse the sidebar to explore each endpoint.
                    </p>
                </div>
            )}
        </div>
    );
}

export { OverviewView };
