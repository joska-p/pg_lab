import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { heading } from '@repo/ui/recipes/typography';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';

import { ENDPOINT_GROUPS, findItemForEndpoint } from '../../data/pipeline-docs-data';
import type { EndpointItem } from '../../data/pipeline-docs-data';

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['6'],
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
    },
    infoBoxTitle: {
        marginBottom: space['2'],
    },
    monoBlock: {
        borderRadius: '0.5rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '2px',
        borderColor: `color-mix(in oklab, ${surface.foreground} 12%, transparent)`,
        padding: space['4'],
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        whiteSpace: 'pre' as const,
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
    notFound: {
        paddingBlock: '3rem',
        textAlign: 'center',
        opacity: 0.6,
        fontSize: typography.fontSizeSm,
    },
});

function SectionHeader({ item }: { item: EndpointItem | undefined }) {
    return (
        <>
            <h2 {...stylex.props(styles.title)}>{item?.label}</h2>
            <Text variant="muted">{item?.description}</Text>
            <p {...stylex.props(styles.path)}>{item?.path}</p>
        </>
    );
}

function InfoBox({
    color = 'neutral',
    title,
    children,
}: {
    color?: ColorNames;
    title?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            {...stylex.props(
                styles.infoBox,
                surfaceStyles({ color, background: 'soft', border: 'subtle' }),
            )}
        >
            {title && <h3 {...stylex.props(heading.level3, styles.infoBoxTitle)}>{title}</h3>}
            {children}
        </div>
    );
}

function MonoBlock({
    color = 'neutral',
    children,
}: {
    color?: ColorNames;
    children: React.ReactNode;
}) {
    return (
        <div
            {...stylex.props(
                styles.monoBlock,
                surfaceStyles({ color, background: 'soft', border: 'subtle' }),
            )}
        >
            {children}
        </div>
    );
}

const RESIZE_CASES = [
    { case: 'maximumPixels', result: 'Scale to fit pixel budget, aspect-ratio-preserved' },
    { case: 'width + height + fill', result: 'Exact dimensions (stretch)' },
    { case: 'width + height + contain', result: 'Fit within bounds, aspect-ratio-preserved' },
    { case: 'width + height + cover', result: 'Fill bounds, aspect-ratio-preserved (crops)' },
    { case: 'width only', result: 'Scale proportionally by width' },
    { case: 'height only', result: 'Scale proportionally by height' },
];

const CONFIG_ROWS = [
    {
        constant: 'DEFAULT_MAXIMUM_PIXELS',
        value: '16,000,000',
        description:
            '~16 megapixel default cap. Auto-downscale if source exceeds this value. Also triggers tiled path for neighborhood ops.',
    },
];

function InternalsView({ id }: { id: string }) {
    const item = findItemForEndpoint(ENDPOINT_GROUPS, { kind: 'internals', id });

    if (id === 'execution-engine') {
        return (
            <Stack gap="6" {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <MonoBlock color="orange">{`runPipeline({ source, steps, context })
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
  └── return { source, final, snapshots }`}</MonoBlock>

                <InfoBox color="orange" title="BufferManager">
                    <Text variant="muted">
                        Double-buffering avoids allocating a new array for every pixel operation.
                        Two <code>Uint8ClampedArray</code> buffers swap on each pass via O(1)
                        pointer flip. <code>snapshot()</code> clones the current buffer into a new
                        ImageData; <code>replaceWith()</code> resets both buffers when resize or
                        global ops change geometry.
                    </Text>
                </InfoBox>
            </Stack>
        );
    }

    if (id === 'fusion-scheduler') {
        return (
            <Stack gap="6" {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <Text variant="muted">
                    Consecutive pixel-type steps are fused into a single pixel loop to avoid N
                    full-image passes. The scheduler queues pixel ops and runs them in one pass when
                    flushed.
                </Text>
                <MonoBlock color="solder">{`For each pixel (i = 0 .. pixelCount-1):
  red,green,blue,alpha = current[i]
  for each (definition, options) in batch:
    [red,green,blue,alpha] = definition.function({ red, green, blue, alpha, options })
  other[i] = clamp(red,green,blue,alpha)
swap()`}</MonoBlock>
                <Text variant="muted">
                    Non-pixel operations (neighborhood, global, resize, snapshot) force a flush
                    before executing, ensuring pending pixel ops are applied first.
                </Text>
            </Stack>
        );
    }

    if (id === 'tiling') {
        return (
            <Stack gap="6" {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <Text variant="muted">
                    Large neighborhood operations are tiled to avoid allocating full-size temporary
                    buffers. Each tile includes a halo border of <code>radius</code> pixels so edge
                    pixels have neighbors available.
                </Text>
                <MonoBlock color="solder">{`TILE_SIZE = 512 pixels per edge

For each tile:
  1. extractTile({ tileX, tileY, tileWidth, tileHeight, halo })
     → copies padded region clamped to image bounds
  2. run convolution on tile (with halo)
  3. blitTile({ destination, tile, tileX, tileY, tileWidth, tileHeight, halo })
     → writes only the non-halo center region back`}</MonoBlock>
                <Text variant="muted">
                    Peak memory drops from <code>(width × height)</code> to{' '}
                    <code>(TILE_SIZE + 2×halo)²</code>. The result is identical to running
                    convolution on the full image.
                </Text>
            </Stack>
        );
    }

    if (id === 'resize-algorithm') {
        return (
            <Stack gap="6" {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <Text variant="muted">
                    Resize uses bilinear interpolation. For each output pixel, it samples the 4
                    nearest source pixels and interpolates.
                </Text>
                <MonoBlock color="aqua">{`sourceX = x * (sourceWidth / targetWidth)
sourceY = y * (sourceHeight / targetHeight)

x0 = floor(sourceX), x1 = min(x0+1, sourceWidth-1)
y0 = floor(sourceY), y1 = min(y0+1, sourceHeight-1)

top    = source[x0,y0] * (1 - dx) + source[x1,y0] * dx
bottom = source[x0,y1] * (1 - dx) + source[x1,y1] * dx
output = top * (1 - dy) + bottom * dy`}</MonoBlock>

                <div {...stylex.props(styles.tableWrapper)}>
                    <table {...stylex.props(styles.table)}>
                        <thead>
                            <tr {...stylex.props(surfaceStyles({ background: 'soft' }))}>
                                <th {...stylex.props(styles.th)}>Case</th>
                                <th {...stylex.props(styles.th)}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RESIZE_CASES.map((row) => (
                                <tr key={row.case}>
                                    <td {...stylex.props(styles.td, styles.tdPrimary)}>
                                        {row.case}
                                    </td>
                                    <td {...stylex.props(styles.td, styles.tdMuted)}>
                                        {row.result}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Stack>
        );
    }

    if (id === 'worker-architecture') {
        return (
            <Stack gap="6" {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <InfoBox color="amber" title="pipeline-worker.ts">
                    <Text variant="muted">
                        Stateless worker. Each message rebuilds the registry from{' '}
                        <code>ALL_MANIPULATIONS</code> and calls <code>runPipeline()</code>. Results
                        are transferred back (zero-copy) via <code>postMessage</code> Transferables.
                    </Text>
                </InfoBox>
                <InfoBox color="purple" title="pipeline-gateway.ts">
                    <Text variant="muted">
                        Main-thread pool manager. Workers are lazily created on first call. If all
                        workers are busy, jobs queue in FIFO order and dispatch as workers free up.
                        Call <code>pipelineGateway.teardown()</code> on app unmount to terminate
                        workers.
                    </Text>
                    <MonoBlock>{`Pool:     up to min(hardwareConcurrency, 4) workers
Queue:    FIFO for overflow
Dispatch: postMessage with Transferable buffers
          (zero-copy pixel transfer)`}</MonoBlock>
                </InfoBox>
            </Stack>
        );
    }

    if (id === 'configuration') {
        return (
            <Stack gap="6" {...stylex.props(styles.root)}>
                <SectionHeader item={item} />
                <div {...stylex.props(styles.tableWrapper)}>
                    <table {...stylex.props(styles.table)}>
                        <thead>
                            <tr {...stylex.props(surfaceStyles({ background: 'soft' }))}>
                                <th {...stylex.props(styles.th)}>Constant</th>
                                <th {...stylex.props(styles.th)}>Value</th>
                                <th {...stylex.props(styles.th)}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CONFIG_ROWS.map((row) => (
                                <tr key={row.constant}>
                                    <td {...stylex.props(styles.td, styles.tdPrimary)}>
                                        {row.constant}
                                    </td>
                                    <td {...stylex.props(styles.td, styles.tdMuted)}>
                                        {row.value}
                                    </td>
                                    <td {...stylex.props(styles.td, styles.tdMuted)}>
                                        {row.description}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Stack>
        );
    }

    return <div {...stylex.props(styles.notFound)}>Section not found</div>;
}

export { InternalsView };
