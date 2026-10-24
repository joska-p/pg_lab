import { Badge } from '@repo/ui/components/Badge';
import { Card } from '@repo/ui/components/Card';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { heading } from '@repo/ui/recipes/typography';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { ENDPOINT_GROUPS, findItemForEndpoint } from '../../data/pipeline-docs-data';
import { CodeBlock } from '../CodeBlock';
import { ChainDemo } from '../demos/ChainDemo';
import { ResizeDemo } from '../demos/ResizeDemo';

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
    infoBox: {
        borderRadius: '0.5rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '2px',
        borderColor: `color-mix(in oklab, ${surface.foreground} 12%, transparent)`,
        padding: space['4'],
        maxWidth: '42rem',
    },
    infoBoxTitle: {
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
    tableWrapper: {
        overflow: 'hidden',
        borderRadius: '0.5rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 12%, transparent)`,
    },
    table: {
        width: '100%',
        textAlign: 'left',
        fontSize: typography.fontSizeSm,
        borderCollapse: 'collapse',
    },
    th: {
        padding: '0.625rem 1rem',
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightSemibold,
        textTransform: 'uppercase' as const,
        letterSpacing: typography.letterSpacingWide,
        opacity: 0.6,
    },
    td: {
        padding: '0.625rem 1rem',
        fontSize: typography.fontSizeXs,
        borderTopWidth: '1px',
        borderTopStyle: 'solid' as const,
        borderTopColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
    },
    tdPrimary: {
        fontWeight: typography.fontWeightMedium,
    },
    tdMuted: {
        opacity: 0.7,
    },
});

const RESIZE_OPTIONS = [
    {
        option: 'width',
        type: 'number',
        description: 'Target width. Height auto-proportional.',
    },
    {
        option: 'height',
        type: 'number',
        description: 'Target height. Width auto-proportional.',
    },
    { option: 'fit', type: 'string', description: 'fill | contain | cover. Default: fill' },
    {
        option: 'maximumPixels',
        type: 'number',
        description: 'Downscale to fit pixel budget, maintain aspect.',
    },
];

const CODE_SAMPLES: Record<'resize' | 'chaining', string> = {
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

function PipelineView({
    id,
    sourceData,
}: {
    id: 'resize' | 'chaining';
    sourceData: ImageData | null;
}) {
    const item = findItemForEndpoint(ENDPOINT_GROUPS, { kind: 'pipeline', id });
    const DemoComponent = demos[id];

    return (
        <Stack gap="6" {...stylex.props(styles.root)}>
            <div {...stylex.props(styles.badgeRow)}>
                <Badge color="amber">PIPELINE</Badge>
                <h2 {...stylex.props(styles.title)}>{item?.label ?? id}</h2>
            </div>
            <Text variant="muted">{item?.description}</Text>
            <p {...stylex.props(styles.path)}>{item?.path}</p>

            {id === 'resize' && (
                <div {...stylex.props(styles.tableWrapper)}>
                    <table {...stylex.props(styles.table)}>
                        <thead>
                            <tr {...stylex.props(surfaceStyles({ background: 'soft' }))}>
                                <th {...stylex.props(styles.th)}>Option</th>
                                <th {...stylex.props(styles.th)}>Type</th>
                                <th {...stylex.props(styles.th)}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RESIZE_OPTIONS.map((row) => (
                                <tr key={row.option}>
                                    <td {...stylex.props(styles.td, styles.tdPrimary)}>
                                        {row.option}
                                    </td>
                                    <td {...stylex.props(styles.td, styles.tdMuted)}>{row.type}</td>
                                    <td {...stylex.props(styles.td, styles.tdMuted)}>
                                        {row.description}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {id === 'chaining' && (
                <div
                    {...stylex.props(
                        styles.infoBox,
                        surfaceStyles({ color: 'amber', background: 'soft', border: 'subtle' }),
                    )}
                >
                    <h3 {...stylex.props(heading.level3, styles.infoBoxTitle)}>
                        How Chaining Works
                    </h3>
                    <Text variant="muted">
                        Steps execute in order. Consecutive pixel-type operations are fused into a
                        single pass for performance. Neighborhood and global ops flush pending pixel
                        ops first. Use <code>snapshot</code> to capture intermediate results.
                    </Text>
                </div>
            )}

            <Card>
                <DemoComponent sourceData={sourceData} />
            </Card>

            <section {...stylex.props(styles.section)}>
                <h3 {...stylex.props(heading.level3, styles.sectionTitle)}>Code Sample</h3>
                <CodeBlock code={CODE_SAMPLES[id]} />
            </section>
        </Stack>
    );
}

export { PipelineView };
