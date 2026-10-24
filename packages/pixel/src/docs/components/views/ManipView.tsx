import { Card } from '@repo/ui/components/Card';

import { CodeBlock } from '../CodeBlock';
import type { ManipInfo } from '../data/pipeline-docs-data';
import { TryItOut } from '../demos/TryItOut';
import { ParamTable } from '../ParamTable';

const TYPE_ACCENT: Record<string, string> = {
    pixel: 'var(--utility-6)',
    neighborhood: 'var(--utility-3)',
    global: 'var(--utility-2)',
    pipeline: 'var(--utility-1)',
    internals: 'var(--utility-8)',
    overview: 'var(--utility-4)',
};

function ManipView({
    manip,
    sourceData,
    paramValues,
    onParamChange,
}: {
    manip: ManipInfo;
    sourceData: ImageData | null;
    paramValues: Record<string, number>;
    onParamChange: (id: string, key: string, value: number) => void;
}) {
    const codeLines = [
        `pipelineGateway.run({`,
        `  sourceImageData: source,`,
        `  steps: [`,
        `    { id: "${manip.id}"${
            manip.params && manip.params.length > 0
                ? `, options: { ${manip.params
                      .map((p) => {
                          const value = paramValues[`${manip.id}:${p.key}`] ?? p.default;

                          return `${p.key}: ${String(value)}`;
                      })
                      .join(', ')} }`
                : ''
        } }`,
        `  ]`,
        `});`,
    ];

    return (
        <div
            className="space-y-6"
            style={
                {
                    '--accent': TYPE_ACCENT[manip.type] ?? 'var(--utility-4)',
                } as React.CSSProperties
            }
        >
            <div className="flex items-center gap-3">
                <span className="bg-accent inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-bold text-background uppercase">
                    {manip.type === 'neighborhood' ? 'NEIGHBOR' : manip.type.toUpperCase()}
                </span>
                <h2 className="text-2xl font-bold">{manip.label}</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm">{manip.description}</p>
            <p className="text-xs opacity-60">{manip.path}</p>

            <div className="border-border bg-muted/30 border-l-accent max-w-2xl rounded-lg border border-l-2 p-4">
                <h3 className="mb-1.5 text-xs font-semibold uppercase">How It Works</h3>
                <p className="text-muted-foreground text-sm">{manip.longDescription}</p>
            </div>

            {manip.params && manip.params.length > 0 && (
                <section>
                    <h3 className="mb-3 text-sm font-semibold uppercase">Parameters</h3>
                    <ParamTable params={manip.params} />
                </section>
            )}

            <section>
                <h3 className="border-b-accent mb-3 inline-block border-b-2 pb-1 text-sm font-semibold uppercase">
                    Try It Out
                </h3>
                <Card>
                    <div className="p-4">
                        <TryItOut
                            sourceData={sourceData}
                            manip={manip}
                            paramValues={paramValues}
                            onParamChange={onParamChange}
                        />
                    </div>
                </Card>
            </section>

            <section>
                <h3 className="border-b-accent mb-3 inline-block border-b-2 pb-1 text-sm font-semibold uppercase">
                    Code Sample
                </h3>
                <CodeBlock code={codeLines.join('\n')} />
            </section>
        </div>
    );
}

export { ManipView };
