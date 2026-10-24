import { Badge } from '@repo/ui/components/Badge';
import { Card } from '@repo/ui/components/Card';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { heading } from '@repo/ui/recipes/typography';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';

import type { ManipInfo } from '../../data/pipeline-docs-data';
import { CodeBlock } from '../CodeBlock';
import { TryItOut } from '../demos/TryItOut';
import { ParamTable } from '../ParamTable';

// Maps manipulation access type → ui color name
const TYPE_COLOR: Record<string, ColorNames> = {
    pixel: 'purple',
    neighborhood: 'solder',
    global: 'aurora',
    pipeline: 'amber',
    internals: 'orange',
    overview: 'aqua',
};

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['6'],
    },
    badgeRow: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
    },
    title: {
        margin: 0,
        fontSize: typography.fontSize2xl,
        fontWeight: typography.fontWeightBold,
    },
    path: {
        opacity: 0.45,
        fontSize: typography.fontSizeXs,
    },
    howItWorks: {
        borderRadius: '0.5rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '2px',
        borderColor: `color-mix(in oklab, ${surface.foreground} 12%, transparent)`,
        padding: space['4'],
        maxWidth: '42rem',
    },
    howItWorksTitle: {
        marginBottom: space['2'],
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
    },
    sectionTitle: {
        display: 'inline-block',
        borderBottomWidth: '2px',
        borderBottomStyle: 'solid' as const,
        borderBottomColor: `color-mix(in oklab, ${surface.foreground} 30%, transparent)`,
        paddingBottom: space['1'],
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
        <Stack gap="6" {...stylex.props(styles.root)}>
            <div {...stylex.props(styles.badgeRow)}>
                <Badge color={color}>
                    {manip.type === 'neighborhood' ? 'NEIGHBOR' : manip.type.toUpperCase()}
                </Badge>
                <h2 {...stylex.props(styles.title)}>{manip.label}</h2>
            </div>

            <Text variant="muted">{manip.description}</Text>
            <p {...stylex.props(styles.path)}>{manip.path}</p>

            <div
                {...stylex.props(
                    styles.howItWorks,
                    surfaceStyles({ color, background: 'soft', border: 'subtle' }),
                )}
            >
                <h3 {...stylex.props(heading.level3, styles.howItWorksTitle)}>How It Works</h3>
                <Text variant="muted">{manip.longDescription}</Text>
            </div>

            {manip.params && manip.params.length > 0 && (
                <section {...stylex.props(styles.section)}>
                    <h3 {...stylex.props(heading.level3)}>Parameters</h3>
                    <ParamTable params={manip.params} />
                </section>
            )}

            <section {...stylex.props(styles.section)}>
                <h3 {...stylex.props(heading.level3, styles.sectionTitle)}>Try It Out</h3>
                <Card>
                    <TryItOut
                        sourceData={sourceData}
                        manip={manip}
                        paramValues={paramValues}
                        onParamChange={onParamChange}
                    />
                </Card>
            </section>

            <section {...stylex.props(styles.section)}>
                <h3 {...stylex.props(heading.level3, styles.sectionTitle)}>Code Sample</h3>
                <CodeBlock code={codeLines.join('\n')} />
            </section>
        </Stack>
    );
}

export { ManipView };
