import { Badge } from '@repo/ui/components/Badge';
import { Card } from '@repo/ui/components/Card';
import { SectionHeading } from '@repo/ui/components/SectionHeading';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { CodeBlock } from '../CodeBlock';
import { ENDPOINT_GROUPS, findItemForEndpoint } from '../data/pipeline-docs-data';
import { ChainDemo } from '../demos/ChainDemo';
import { ResizeDemo } from '../demos/ResizeDemo';

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
    tableBox: {
        borderRadius: '8px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: typography.fontSizeSm,
        color: surface.foreground,
    },
    tableHead: {
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightSemibold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: 'uppercase',
    },
    tableCell: {
        paddingBlock: space['2'],
        paddingInline: space['4'],
        borderBottom: `1px solid`,
        borderBottomColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        fontSize: typography.fontSizeXs,
    },
    tableCellName: {
        color: surface.foreground,
        fontWeight: typography.fontWeightMedium,
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

// 'utility-1' du tailwind d'origine → teinte du système ui.
const ACCENT = 'aurora';

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
        <div {...stylex.props(styles.root)}>
            <div {...stylex.props(styles.header)}>
                <Badge color={ACCENT} background="solid" radius="full">
                    PIPELINE
                </Badge>
                <h2 {...stylex.props(styles.title)}>{item?.label ?? id}</h2>
            </div>
            <p {...stylex.props(styles.description)}>{item?.description}</p>
            <p {...stylex.props(styles.path)}>{item?.path}</p>

            {id === 'resize' && (
                <div {...stylex.props(styles.tableBox)}>
                    <table {...stylex.props(styles.table)}>
                        <thead>
                            <tr {...stylex.props(styles.tableHead)}>
                                <th {...stylex.props(styles.tableCell)}>Option</th>
                                <th {...stylex.props(styles.tableCell)}>Type</th>
                                <th {...stylex.props(styles.tableCell)}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    width
                                </td>
                                <td {...stylex.props(styles.tableCell)}>number</td>
                                <td {...stylex.props(styles.tableCell)}>
                                    Target width. Height auto-proportional.
                                </td>
                            </tr>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    height
                                </td>
                                <td {...stylex.props(styles.tableCell)}>number</td>
                                <td {...stylex.props(styles.tableCell)}>
                                    Target height. Width auto-proportional.
                                </td>
                            </tr>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    fit
                                </td>
                                <td {...stylex.props(styles.tableCell)}>string</td>
                                <td {...stylex.props(styles.tableCell)}>
                                    fill | contain | cover. Default: fill
                                </td>
                            </tr>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    maximumPixels
                                </td>
                                <td {...stylex.props(styles.tableCell)}>number</td>
                                <td {...stylex.props(styles.tableCell)}>
                                    Downscale to fit pixel budget, maintain aspect.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {id === 'chaining' && (
                <div {...stylex.props(styles.noteBox)}>
                    <p {...stylex.props(styles.noteHeading)}>How Chaining Works</p>
                    <p {...stylex.props(styles.noteText)}>
                        Steps execute in order. Consecutive pixel-type operations are fused into a
                        single pass for performance. Neighborhood and global ops flush pending pixel
                        ops first. Use <code> </code>snapshot to capture intermediate results.
                    </p>
                </div>
            )}

            <Card color={ACCENT} background="soft" border="strong" radius="md">
                <DemoComponent sourceData={sourceData} />
            </Card>

            <section {...stylex.props(styles.codeSample)}>
                <SectionHeading title="Code Sample" color={ACCENT} />
                <CodeBlock code={codeSamples[id]} />
            </section>
        </div>
    );
}

export { PipelineView };
