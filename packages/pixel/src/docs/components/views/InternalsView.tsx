import { Card } from '@repo/ui/components/Card';
import { SectionHeading } from '@repo/ui/components/SectionHeading';
import { Text } from '@repo/ui/components/Text';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { ENDPOINT_GROUPS, findItemForEndpoint } from '../data/pipeline-docs-data';
import type { EndpointItem } from '../data/pipeline-docs-data';

const TYPE_COLOR: Record<
    string,
    'neutral' | 'aurora' | 'solder' | 'purple' | 'amber' | 'aqua' | 'orange'
> = {
    executionEngine: 'purple',
    fusionScheduler: 'solder',
    tiling: 'aqua',
    resizeAlgorithm: 'neutral',
    workerArchitecture: 'aurora',
    configuration: 'amber',
};

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['6'],
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
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
    code: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        color: surface.foreground,
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        borderRadius: '8px',
        borderWidth: '1px',
        borderStyle: 'solid',
        padding: space['4'],
    },
    boxBorder: {
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
    },
    boxHeading: {
        margin: 0,
        marginBottom: space['2'],
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightSemibold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: 'uppercase',
        color: surface.foreground,
    },
    boxText: {
        margin: 0,
        fontSize: typography.fontSizeSm,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    pre: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        lineHeight: typography.lineHeightNormal,
        color: surface.foreground,
        whiteSpace: 'pre-wrap',
        margin: 0,
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
    notFound: {
        paddingBlock: space['12'],
        textAlign: 'center',
        fontSize: typography.fontSizeSm,
        color: `color-mix(in oklab, ${surface.foreground} 50%, transparent)`,
    },
});

function SectionHeader({ item }: { item: EndpointItem | undefined }) {
    return (
        <>
            <h2 {...stylex.props(styles.title)}>{item?.label}</h2>
            <p {...stylex.props(styles.description)}>{item?.description}</p>
            <p {...stylex.props(styles.path)}>{item?.path}</p>
        </>
    );
}

function codeBlock(
    text: string,
    color: 'neutral' | 'aurora' | 'solder' | 'purple' | 'amber' | 'aqua' | 'orange',
) {
    return (
        <div
            {...stylex.props(
                styles.box,
                styles.boxBorder,
                surfaceStyles({ color, background: 'soft', border: 'strong', radius: 'md' }),
            )}
        >
            <pre {...stylex.props(styles.pre)}>{text}</pre>
        </div>
    );
}

function InternalsView({ id }: { id: string }) {
    const item = findItemForEndpoint(ENDPOINT_GROUPS, { kind: 'internals', id });

    if (id === 'execution-engine') {
        const color = TYPE_COLOR.executionEngine;
        return (
            <div {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                {codeBlock(
                    `runPipeline({ source, steps, context })
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
  └── return { source, final, snapshots }`,
                    color,
                )}
                <Card color={color} background="soft" border="strong" radius="md">
                    <SectionHeading title="BufferManager" color={color} />
                    <Text variant="muted">
                        Double-buffering avoids allocating a new array for every pixel operation.
                        Two <code {...stylex.props(styles.code)}>Uint8ClampedArray</code> buffers
                        swap on each pass via O(1) pointer flip.{' '}
                        <code {...stylex.props(styles.code)}>snapshot()</code> clones the current
                        buffer into a new ImageData;{' '}
                        <code {...stylex.props(styles.code)}>replaceWith()</code> resets both
                        buffers when resize or global ops change geometry.
                    </Text>
                </Card>
            </div>
        );
    }

    if (id === 'fusion-scheduler') {
        const color = TYPE_COLOR.fusionScheduler;
        return (
            <div {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <Text variant="muted">
                    Consecutive pixel-type steps are fused into a single pixel loop to avoid N
                    full-image passes. The scheduler queues pixel ops and runs them in one pass when
                    flushed.
                </Text>
                {codeBlock(
                    `For each pixel (i = 0 .. pixelCount-1):
  red,green,blue,alpha = current[i]
  for each (definition, options) in batch:
    [red,green,blue,alpha] = definition.function({ red, green, blue, alpha, options })
  other[i] = clamp(red,green,blue,alpha)
swap()`,
                    color,
                )}
                <Text variant="muted">
                    Non-pixel operations (neighborhood, global, resize, snapshot) force a flush
                    before executing, ensuring pending pixel ops are applied first.
                </Text>
            </div>
        );
    }

    if (id === 'tiling') {
        const color = TYPE_COLOR.tiling;
        return (
            <div {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <Text variant="muted">
                    Large neighborhood operations are tiled to avoid allocating full-size temporary
                    buffers. Each tile includes a halo border of{' '}
                    <code {...stylex.props(styles.code)}>radius</code> pixels so edge pixels have
                    neighbors available.
                </Text>
                {codeBlock(
                    `TILE_SIZE = 512 pixels per edge

For each tile:
  1. extractTile({ tileX, tileY, tileWidth, tileHeight, halo })
     → copies padded region clamped to image bounds
  2. run convolution on tile (with halo)
  3. blitTile({ destination, tile, tileX, tileY, tileWidth, tileHeight, halo })
     → writes only the non-halo center region back}`,
                    color,
                )}
                <Text variant="muted">
                    Peak memory drops from{' '}
                    <code {...stylex.props(styles.code)}>(width × height)</code>
                    to <code {...stylex.props(styles.code)}>(TILE_SIZE + 2×halo)²</code>. The result
                    is identical to running convolution on the full image.
                </Text>
            </div>
        );
    }

    if (id === 'resize-algorithm') {
        const color = TYPE_COLOR.resizeAlgorithm;
        return (
            <div {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <Text variant="muted">
                    Resize uses bilinear interpolation. For each output pixel, it samples the 4
                    nearest source pixels and interpolates.
                </Text>
                {codeBlock(
                    `sourceX = x * (sourceWidth / targetWidth)
sourceY = y * (sourceHeight / targetHeight)

x0 = floor(sourceX), x1 = min(x0+1, sourceWidth-1)
y0 = floor(sourceY), y1 = min(y0+1, sourceHeight-1)

top    = source[x0,y0] * (1 - dx) + source[x1,y0] * dx
bottom = source[x0,y1] * (1 - dx) + source[x1,y1] * dx
output = top * (1 - dy) + bottom * dy`,
                    color,
                )}
                <div {...stylex.props(styles.tableBox)}>
                    <table {...stylex.props(styles.table)}>
                        <thead>
                            <tr {...stylex.props(styles.tableHead)}>
                                <th {...stylex.props(styles.tableCell)}>Case</th>
                                <th {...stylex.props(styles.tableCell)}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    maximumPixels
                                </td>
                                <td {...stylex.props(styles.tableCell)}>
                                    Scale to fit pixel budget, aspect-ratio-preserved
                                </td>
                            </tr>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    width + height + fill
                                </td>
                                <td {...stylex.props(styles.tableCell)}>
                                    Exact dimensions (stretch)
                                </td>
                            </tr>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    width + height + contain
                                </td>
                                <td {...stylex.props(styles.tableCell)}>
                                    Fit within bounds, aspect-ratio-preserved
                                </td>
                            </tr>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    width + height + cover
                                </td>
                                <td {...stylex.props(styles.tableCell)}>
                                    Fill bounds, aspect-ratio-preserved (crops)
                                </td>
                            </tr>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    width only
                                </td>
                                <td {...stylex.props(styles.tableCell)}>
                                    Scale proportionally by width
                                </td>
                            </tr>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    height only
                                </td>
                                <td {...stylex.props(styles.tableCell)}>
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
        const color = TYPE_COLOR.workerArchitecture;
        return (
            <div {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <Card color={color} background="soft" border="strong" radius="md">
                    <SectionHeading title="pipeline-worker.ts" color={color} />
                    <Text variant="muted">
                        Stateless worker. Each message rebuilds the registry from{' '}
                        <code {...stylex.props(styles.code)}>ALL_MANIPULATIONS</code> and calls{' '}
                        <code {...stylex.props(styles.code)}>runPipeline()</code>. Results are
                        transferred back (zero-copy) via{' '}
                        <code {...stylex.props(styles.code)}>postMessage</code> Transferables.
                    </Text>
                </Card>
                <Card color={color} background="soft" border="strong" radius="md">
                    <SectionHeading title="pipeline-gateway.ts" color={color} />
                    <Text variant="muted">
                        Main-thread pool manager. Workers are lazily created on first call. If all
                        workers are busy, jobs queue in FIFO order and dispatch as workers free up.
                        Call <code {...stylex.props(styles.code)}>pipelineGateway.teardown()</code>
                        on app unmount to terminate workers.
                    </Text>
                    <div
                        {...stylex.props(
                            styles.box,
                            styles.boxBorder,
                            surfaceStyles({
                                color,
                                background: 'soft',
                                border: 'strong',
                                radius: 'md',
                            }),
                        )}
                    >
                        <pre {...stylex.props(styles.pre)}>
                            Pool: up to min(hardwareConcurrency, 4) workers Queue: FIFO for overflow
                            Dispatch: postMessage with Transferable buffers (zero-copy pixel
                            transfer)
                        </pre>
                    </div>
                </Card>
            </div>
        );
    }

    if (id === 'configuration') {
        return (
            <div {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <div {...stylex.props(styles.tableBox)}>
                    <table {...stylex.props(styles.table)}>
                        <thead>
                            <tr {...stylex.props(styles.tableHead)}>
                                <th {...stylex.props(styles.tableCell)}>Constant</th>
                                <th {...stylex.props(styles.tableCell)}>Value</th>
                                <th {...stylex.props(styles.tableCell)}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td {...stylex.props(styles.tableCell, styles.tableCellName)}>
                                    DEFAULT_MAXIMUM_PIXELS
                                </td>
                                <td {...stylex.props(styles.tableCell)}>16,000,000</td>
                                <td {...stylex.props(styles.tableCell)}>
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

    return (
        <div {...stylex.props(styles.notFound)}>
            <Text variant="muted">Section not found</Text>
        </div>
    );
}

export { InternalsView };
