import { Badge } from '@repo/ui/components/Badge';
import { Card } from '@repo/ui/components/Card';
import { SectionHeading } from '@repo/ui/components/SectionHeading';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { CodeBlock } from '../CodeBlock';
import type { ManipInfo } from '../data/pipeline-docs-data';
import { TryItOut } from '../demos/TryItOut';
import { ParamTable } from '../ParamTable';

const TYPE_COLOR: Record<
    string,
    'neutral' | 'aurora' | 'solder' | 'purple' | 'amber' | 'aqua' | 'orange'
> = {
    pixel: 'aurora',
    neighborhood: 'solder',
    global: 'aqua',
    pipeline: 'aurora',
    internals: 'purple',
    overview: 'neutral',
};

const TYPE_LABEL: Record<string, string> = {
    pixel: 'PIXEL',
    neighborhood: 'NEIGHBOR',
    global: 'GLOBAL',
    pipeline: 'PIPELINE',
    internals: 'INTERNALS',
    overview: 'OVERVIEW',
};

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['6'],
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
    },
    title: {
        margin: 0,
        fontSize: typography.fontSize2xl,
        fontWeight: typography.fontWeightBold,
        color: surface.foreground,
    },
    description: {
        margin: 0,
        maxWidth: '48ch',
        fontSize: typography.fontSizeSm,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    path: {
        margin: 0,
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 50%, transparent)`,
    },
    noteBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
        borderRadius: '8px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
        padding: space['4'],
        maxWidth: '48ch',
    },
    noteHeading: {
        margin: 0,
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightSemibold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: 'uppercase',
        color: surface.foreground,
    },
    noteText: {
        margin: 0,
        fontSize: typography.fontSizeSm,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    codeSample: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
});

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
    const color = TYPE_COLOR[manip.type] ?? 'neutral';

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
        <div {...stylex.props(styles.root)}>
            <div {...stylex.props(styles.header)}>
                <Badge color={color} background="solid" radius="full">
                    {TYPE_LABEL[manip.type] ?? manip.type}
                </Badge>
                <h1 {...stylex.props(styles.title)}>{manip.label}</h1>
            </div>
            <p {...stylex.props(styles.description)}>{manip.description}</p>
            <p {...stylex.props(styles.path)}>{manip.path}</p>

            <div
                {...stylex.props(
                    styles.noteBox,
                    surfaceStyles({ color, background: 'soft', border: 'strong', radius: 'md' }),
                )}
            >
                <p {...stylex.props(styles.noteHeading)}>How It Works</p>
                <p {...stylex.props(styles.noteText)}>{manip.longDescription}</p>
            </div>

            {manip.params && manip.params.length > 0 && (
                <section>
                    <SectionHeading title="Parameters" color={color} />
                    <ParamTable params={manip.params} />
                </section>
            )}

            <section>
                <SectionHeading title="Try It Out" color={color} />
                <Card color={color} background="soft" border="strong" radius="md">
                    <TryItOut
                        sourceData={sourceData}
                        manip={manip}
                        paramValues={paramValues}
                        onParamChange={onParamChange}
                    />
                </Card>
            </section>

            <section {...stylex.props(styles.codeSample)}>
                <SectionHeading title="Code Sample" color={color} />
                <CodeBlock code={codeLines.join('\n')} />
            </section>
        </div>
    );
}

export { ManipView };
