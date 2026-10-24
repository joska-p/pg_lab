import { Card } from '@repo/ui/components/Card';

import { CodeBlock } from '../CodeBlock';
import { ENDPOINT_GROUPS, findItemForEndpoint } from '../data/pipeline-docs-data';
import { ChainDemo } from '../demos/ChainDemo';
import { ResizeDemo } from '../demos/ResizeDemo';

function PipelineView({
    id,
    sourceData,
}: {
    id: 'resize' | 'chaining';
    sourceData: ImageData | null;
}) {
    const item = findItemForEndpoint(ENDPOINT_GROUPS, { kind: 'pipeline', id });
    const codeSamples: Record<'resize' | 'chaining', string> = {
        resize: [
            `pixel.run({`,
            `  sourceImageData: source,`,
            `  steps: [`,
            `    { id: "resize", options: { width: 100 } }`,
            `  ]`,
            `});`,
        ].join('\n'),
        chaining: [
            `const result = await pixel.run({`,
            `  sourceImageData: source,`,
            `  steps: [`,
            `    { id: "brightness", options: { value: 1.2 } },`,
            `    { id: "contrast", options: { value: 1.3 } },`,
            `    { id: "sharpen", options: { strength: 1.5 } }`,
            `  ]`,
            `});`,
        ].join('\n'),
    };

    const demos: Record<
        'resize' | 'chaining',
        (props: { sourceData: ImageData | null }) => React.JSX.Element
    > = {
        resize: ResizeDemo,
        chaining: ChainDemo,
    };

    const DemoComponent = demos[id];

    return (
        <div
            className="space-y-6"
            style={{ '--accent': 'var(--utility-1)' } as React.CSSProperties}
        >
            <div className="flex items-center gap-3">
                <span className="bg-accent inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-bold text-background uppercase">
                    PIPELINE
                </span>
                <h2 className="text-2xl font-bold">{item?.label ?? id}</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm">{item?.description}</p>
            <p className="text-xs opacity-60">{item?.path}</p>

            {id === 'resize' && (
                <div className="border-border overflow-hidden rounded-lg border">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground border-border border-b text-xs font-semibold uppercase">
                                <th className="px-4 py-2.5">Option</th>
                                <th className="px-4 py-2.5">Type</th>
                                <th className="px-4 py-2.5">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">width</td>
                                <td className="text-foreground/80 px-4 py-2.5 text-xs">number</td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Target width. Height auto-proportional.
                                </td>
                            </tr>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">height</td>
                                <td className="text-foreground/80 px-4 py-2.5 text-xs">number</td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Target height. Width auto-proportional.
                                </td>
                            </tr>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">fit</td>
                                <td className="text-foreground/80 px-4 py-2.5 text-xs">string</td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    fill | contain | cover. Default: fill
                                </td>
                            </tr>
                            <tr className="border-border border-b">
                                <td className="text-primary px-4 py-2.5 text-xs">maximumPixels</td>
                                <td className="text-foreground/80 px-4 py-2.5 text-xs">number</td>
                                <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                    Downscale to fit pixel budget, maintain aspect.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {id === 'chaining' && (
                <div className="border-border bg-muted/30 border-l-accent max-w-2xl rounded-lg border border-l-2 p-4">
                    <h3 className="mb-1.5 text-xs font-semibold uppercase">How Chaining Works</h3>
                    <p className="text-muted-foreground text-sm">
                        Steps execute in order. Consecutive pixel-type operations are fused into a
                        single pass for performance. Neighborhood and global ops flush pending pixel
                        ops first. Use
                        <code className="mx-1">snapshot</code> to capture intermediate results.
                    </p>
                </div>
            )}

            <Card>
                <div className="p-4">
                    <DemoComponent sourceData={sourceData} />
                </div>
            </Card>

            <section>
                <h3 className="border-b-accent mb-3 inline-block border-b-2 pb-1 text-sm font-semibold uppercase">
                    Code Sample
                </h3>
                <CodeBlock code={codeSamples[id]} />
            </section>
        </div>
    );
}

export { PipelineView };
